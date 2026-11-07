import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { CreatePermisoDto } from './dto/create-permiso.dto';
import { Permiso } from './entities/permiso.entity';
import { Perfil } from '../perfil/entities/perfil.entity';
import { Accion } from '../accion/entities/accion.entity';
import { RbacService } from '../rbac/rbac.service';

@Injectable()
export class PermisoService {
  constructor(
    @InjectRepository(Permiso) private readonly repository: Repository<Permiso>,
    @InjectRepository(Perfil) private readonly perfilRepo: Repository<Perfil>,
    @InjectRepository(Accion) private readonly accionRepo: Repository<Accion>,
    private readonly rbac: RbacService,
  ) {}

  private async perfilActivo(prflId: number): Promise<Perfil> {
    const perfil = await this.perfilRepo.findOne({ where: { id: prflId } });
    if (!perfil)
      throw new NotFoundException(`No existe el perfil con prfl_id=${prflId}`);
    if (!perfil.estado)
      throw new BadRequestException(
        `El perfil "${perfil.nombre}" está inactivo`,
      );
    return perfil;
  }

  /** Crea el permiso o lo reactiva si existía con estado 'F' (respeta uq_prms_prfl_accn). */
  private async otorgar(
    prflId: number,
    accnId: number,
  ): Promise<'creado' | 'reactivado' | 'existente'> {
    const previo = await this.repository.findOne({
      where: { prfl_id: prflId, accn_id: accnId },
    });
    if (previo?.estado) return 'existente';
    if (previo) {
      await this.repository.update(previo.id, { estado: true });
      return 'reactivado';
    }
    await this.repository.save(
      this.repository.create({
        prfl_id: prflId,
        accn_id: accnId,
        estado: true,
      }),
    );
    return 'creado';
  }

  async create(dto: CreatePermisoDto) {
    const perfil = await this.perfilActivo(dto.prfl_id);
    const accion = await this.accionRepo.findOne({
      where: { id: dto.accn_id },
    });
    if (!accion)
      throw new NotFoundException(
        `No existe la acción con accn_id=${dto.accn_id}`,
      );
    if (!accion.estado)
      throw new BadRequestException(
        `La acción "${accion.nombre}" está inactiva`,
      );

    const resultado = await this.otorgar(perfil.id, accion.id);
    if (resultado === 'existente') {
      throw new ConflictException(
        `El perfil ${perfil.codigo} ya tiene la acción "${accion.nombre}"`,
      );
    }
    this.rbac.invalidar();
    const data = await this.repository.findOne({
      where: { prfl_id: perfil.id, accn_id: accion.id },
      relations: { perfil: true, accion: true },
    });
    return {
      message: `Permiso "${accion.nombre}" ${resultado} para ${perfil.codigo}`,
      data,
    };
  }

  /** Asignación masiva de acciones a un perfil. */
  async asignarAcciones(prflId: number, accnIds: number[]) {
    const perfil = await this.perfilActivo(prflId);
    const ids = [...new Set(accnIds)];
    const acciones = await this.accionRepo.find({
      where: { id: In(ids), estado: true },
    });
    const validas = new Set(acciones.map((a) => a.id));
    const invalidas = ids.filter((id) => !validas.has(id));
    if (invalidas.length) {
      throw new BadRequestException(
        `Acciones inexistentes o inactivas: ${invalidas.join(', ')}`,
      );
    }

    const resumen = { creados: 0, reactivados: 0, yaExistian: 0 };
    for (const id of ids) {
      const r = await this.otorgar(perfil.id, id);
      if (r === 'creado') resumen.creados++;
      else if (r === 'reactivado') resumen.reactivados++;
      else resumen.yaExistian++;
    }
    this.rbac.invalidar();
    return {
      message: `Acciones asignadas al perfil ${perfil.codigo}`,
      data: { prfl_id: perfil.id, ...resumen },
    };
  }

  async findAll(filtro: {
    prfl_id?: number;
    accn_id?: number;
    incluirInactivos?: boolean;
  }) {
    const where: FindOptionsWhere<Permiso> = {};
    if (!filtro.incluirInactivos) where.estado = true;
    if (filtro.prfl_id) where.prfl_id = filtro.prfl_id;
    if (filtro.accn_id) where.accn_id = filtro.accn_id;
    const data = await this.repository.find({
      where,
      relations: { perfil: true, accion: true },
      order: { prfl_id: 'ASC', accn_id: 'ASC' },
    });
    return { message: 'Matriz de permisos (seguridad.prms)', data };
  }

  async findOne(id: number) {
    const data = await this.repository.findOne({
      where: { id },
      relations: { perfil: true, accion: true },
    });
    if (!data)
      throw new NotFoundException(`No existe el permiso con prms_id=${id}`);
    return { message: `Permiso con prms_id=${id}`, data };
  }

  /** Revoca el permiso (borrado lógico). */
  async remove(id: number) {
    const { data } = await this.findOne(id);
    await this.repository.update(id, { estado: false });
    this.rbac.invalidar();
    return {
      message: `Permiso "${data.accion?.nombre}" revocado al perfil ${data.perfil?.codigo}`,
      data: { id, estado: false },
    };
  }

  async revocar(prflId: number, accnId: number) {
    const permiso = await this.repository.findOne({
      where: { prfl_id: prflId, accn_id: accnId, estado: true },
    });
    if (!permiso) {
      throw new NotFoundException(
        `El perfil prfl_id=${prflId} no tiene asignada la acción accn_id=${accnId}`,
      );
    }
    return this.remove(permiso.id);
  }
}

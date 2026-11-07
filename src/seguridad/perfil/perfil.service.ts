import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePerfilDto } from './dto/create-perfil.dto';
import { UpdatePerfilDto } from './dto/update-perfil.dto';
import { Perfil } from './entities/perfil.entity';
import { Permiso } from '../permiso/entities/permiso.entity';
import { RbacService } from '../rbac/rbac.service';

/** Perfil con acceso total; no se puede desactivar para no dejar el sistema sin administrador. */
const PERFIL_PROTEGIDO = 'ADM';

@Injectable()
export class PerfilService {
  constructor(
    @InjectRepository(Perfil) private readonly repository: Repository<Perfil>,
    @InjectRepository(Permiso)
    private readonly permisoRepo: Repository<Permiso>,
    private readonly rbac: RbacService,
  ) {}

  private async validarCodigoUnico(codigo: string, exceptoId?: number) {
    const existente = await this.repository.findOne({ where: { codigo } });
    if (existente && existente.id !== exceptoId) {
      throw new ConflictException(
        `Ya existe el perfil con código "${codigo}" (prfl_id=${existente.id})`,
      );
    }
  }

  private async validarPadre(padreId: number | undefined, id?: number) {
    if (padreId === undefined) return;
    if (padreId === id)
      throw new BadRequestException('Un perfil no puede ser padre de sí mismo');
    if (!(await this.repository.exists({ where: { id: padreId } }))) {
      throw new BadRequestException(
        `El perfil padre (prfl_id=${padreId}) no existe`,
      );
    }
  }

  async create(dto: CreatePerfilDto) {
    await this.validarCodigoUnico(dto.codigo);
    await this.validarPadre(dto.padreId);
    const perfil = await this.repository.save(
      this.repository.create({ ...dto, estado: true }),
    );
    this.rbac.invalidar();
    return {
      message: `Perfil "${perfil.nombre}" creado correctamente`,
      data: perfil,
    };
  }

  async findAll(incluirInactivos = false) {
    const data = await this.repository.find({
      where: incluirInactivos ? {} : { estado: true },
      order: { id: 'ASC' },
    });
    return { message: 'Listado de perfiles institucionales', data };
  }

  async findOne(id: number) {
    const perfil = await this.repository.findOne({ where: { id } });
    if (!perfil)
      throw new NotFoundException(`No existe el perfil con prfl_id=${id}`);
    return perfil;
  }

  async detalle(id: number) {
    return {
      message: `Perfil con prfl_id=${id}`,
      data: await this.findOne(id),
    };
  }

  /** Acciones que tiene asignadas el perfil (seguridad.prms). */
  async permisos(id: number) {
    const perfil = await this.findOne(id);
    const permisos = await this.permisoRepo.find({
      where: { prfl_id: id, estado: true },
      relations: { accion: true },
      order: { accn_id: 'ASC' },
    });
    return {
      message: `Permisos del perfil ${perfil.codigo ?? perfil.nombre}`,
      data: {
        perfil: { id: perfil.id, codigo: perfil.codigo, nombre: perfil.nombre },
        total: permisos.length,
        acciones: permisos.map((p) => ({
          prms_id: p.id,
          accn_id: p.accn_id,
          nombre: p.accion?.nombre,
          descripcion: p.accion?.descripcion,
          activa: p.accion?.estado,
        })),
      },
    };
  }

  async update(id: number, dto: UpdatePerfilDto) {
    const perfil = await this.findOne(id);
    if (dto.codigo && dto.codigo !== perfil.codigo) {
      if (perfil.codigo === PERFIL_PROTEGIDO) {
        throw new BadRequestException(
          `El código del perfil ${PERFIL_PROTEGIDO} no se puede cambiar`,
        );
      }
      await this.validarCodigoUnico(dto.codigo, id);
    }
    await this.validarPadre(dto.padreId, id);
    Object.assign(perfil, dto);
    const data = await this.repository.save(perfil);
    this.rbac.invalidar();
    return { message: 'Perfil actualizado correctamente', data };
  }

  /** Borrado lógico (estado = 'F'). */
  async remove(id: number) {
    const perfil = await this.findOne(id);
    if (perfil.codigo === PERFIL_PROTEGIDO) {
      throw new BadRequestException(
        `El perfil ${PERFIL_PROTEGIDO} no se puede desactivar`,
      );
    }
    await this.repository.update(id, { estado: false });
    this.rbac.invalidar();
    return {
      message: `Perfil "${perfil.nombre}" desactivado`,
      data: { id, estado: false },
    };
  }
}

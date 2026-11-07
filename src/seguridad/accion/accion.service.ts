import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { CreateAccionDto } from './dto/create-accion.dto';
import { UpdateAccionDto } from './dto/update-accion.dto';
import { Accion } from './entities/accion.entity';
import { RbacService } from '../rbac/rbac.service';

@Injectable()
export class AccionService {
  constructor(
    @InjectRepository(Accion) private readonly repository: Repository<Accion>,
    private readonly rbac: RbacService,
  ) {}

  private async validarNombreUnico(nombre: string, exceptoId?: number) {
    const existente = await this.repository.findOne({ where: { nombre } });
    if (existente && existente.id !== exceptoId) {
      throw new ConflictException(
        `Ya existe la acción "${nombre}" (accn_id=${existente.id})`,
      );
    }
  }

  async create(dto: CreateAccionDto) {
    await this.validarNombreUnico(dto.nombre);
    const data = await this.repository.save(
      this.repository.create({ ...dto, estado: true }),
    );
    this.rbac.invalidar();
    return { message: `Acción "${data.nombre}" registrada`, data };
  }

  async findAll(incluirInactivos = false, q?: string) {
    const where: FindOptionsWhere<Accion> = {};
    if (!incluirInactivos) where.estado = true;
    if (q) where.nombre = ILike(`%${q}%`);
    const data = await this.repository.find({
      where,
      order: { nombre: 'ASC' },
    });
    return { message: 'Catálogo de acciones del sistema', data };
  }

  async findOne(id: number) {
    const accion = await this.repository.findOne({ where: { id } });
    if (!accion)
      throw new NotFoundException(`No existe la acción con accn_id=${id}`);
    return accion;
  }

  async detalle(id: number) {
    return {
      message: `Acción con accn_id=${id}`,
      data: await this.findOne(id),
    };
  }

  async update(id: number, dto: UpdateAccionDto) {
    const accion = await this.findOne(id);
    if (dto.nombre && dto.nombre !== accion.nombre)
      await this.validarNombreUnico(dto.nombre, id);
    Object.assign(accion, dto);
    const data = await this.repository.save(accion);
    this.rbac.invalidar();
    return { message: 'Acción actualizada correctamente', data };
  }

  /** Borrado lógico: la acción queda registrada pero nadie (salvo ADM) puede ejecutarla. */
  async remove(id: number) {
    const accion = await this.findOne(id);
    await this.repository.update(id, { estado: false });
    this.rbac.invalidar();
    return {
      message: `Acción "${accion.nombre}" desactivada`,
      data: { id, estado: false },
    };
  }
}

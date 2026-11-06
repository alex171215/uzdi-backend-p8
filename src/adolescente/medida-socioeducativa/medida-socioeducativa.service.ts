import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMedidaSocioeducativaDto } from './dto/create-medida-socioeducativa.dto';
import { UpdateMedidaSocioeducativaDto } from './dto/update-medida-socioeducativa.dto';
import { MedidaSocioeducativa } from './entities/medida-socioeducativa.entity';
import { MedidaExpediente } from '../medida-expediente/entities/medida-expediente.entity';

@Injectable()
export class MedidaSocioeducativaService {
  constructor(
    @InjectRepository(MedidaSocioeducativa)
    private readonly repository: Repository<MedidaSocioeducativa>,
    @InjectRepository(MedidaExpediente)
    private readonly medidaExpedienteRepo: Repository<MedidaExpediente>,
  ) {}

  // el nombre es UNIQUE en la BD, lo revisamos antes para devolver 409 y no un error 500
  private async validarNombreUnico(
    nombre: string | undefined,
    excludeId?: number,
  ) {
    if (!nombre) return;
    const existente = await this.repository.findOne({ where: { nombre } });
    if (existente && existente.id !== excludeId) {
      throw new ConflictException(
        `Ya existe una medida socioeducativa llamada "${nombre}".`,
      );
    }
  }

  async create(dto: CreateMedidaSocioeducativaDto) {
    await this.validarNombreUnico(dto.nombre);
    const newEntity = this.repository.create(dto);
    return this.repository.save(newEntity);
  }

  // por defecto solo devuelve las activas
  findAll(incluirInactivos = false) {
    return this.repository.find({
      where: incluirInactivos ? {} : { estado: true },
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: number) {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity)
      throw new NotFoundException(`Medida socioeducativa ${id} no encontrada.`);
    return entity;
  }

  async findExpedientes(id: number) {
    await this.findOne(id);
    return this.medidaExpedienteRepo.find({
      where: { mdso_id: id, estado: true },
      relations: { expediente: true },
      order: { expe_id: 'DESC', orden: 'ASC' },
    });
  }

  async update(id: number, dto: UpdateMedidaSocioeducativaDto) {
    await this.findOne(id);
    await this.validarNombreUnico(dto.nombre, id);
    await this.repository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    // borrado logico: solo se cambia el estado a 'F'
    await this.repository.update(id, { estado: false });
    return { id, estado: false };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInfraccionDto } from './dto/create-infraccion.dto';
import { UpdateInfraccionDto } from './dto/update-infraccion.dto';
import { Infraccion } from './entities/infraccion.entity';
import { Expediente } from '../expediente/entities/expediente.entity';

@Injectable()
export class InfraccionService {
  constructor(
    @InjectRepository(Infraccion)
    private readonly repository: Repository<Infraccion>,
    @InjectRepository(Expediente)
    private readonly expedienteRepo: Repository<Expediente>,
  ) {}

  create(createInfraccionDto: CreateInfraccionDto) {
    const newEntity = this.repository.create(createInfraccionDto);
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
    if (!entity) throw new NotFoundException(`Infracción ${id} no encontrada.`);
    return entity;
  }

  async findExpedientes(id: number) {
    await this.findOne(id);
    return this.expedienteRepo.find({
      where: { infc_id: id, estado: true },
      order: { id: 'DESC' },
    });
  }

  async update(id: number, updateInfraccionDto: UpdateInfraccionDto) {
    await this.findOne(id);
    await this.repository.update(id, updateInfraccionDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    // borrado logico: solo se cambia el estado a 'F'
    await this.repository.update(id, { estado: false });
    return { id, estado: false };
  }
}

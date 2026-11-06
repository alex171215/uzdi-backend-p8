import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccionDto } from './dto/create-accion.dto';
import { UpdateAccionDto } from './dto/update-accion.dto';
import { Accion } from './entities/accion.entity';

@Injectable()
export class AccionService {
  constructor(
    @InjectRepository(Accion)
    private readonly repository: Repository<Accion>,
  ) {}

  create(createAccionDto: CreateAccionDto) {
    const newEntity = this.repository.create(createAccionDto);
    return this.repository.save(newEntity);
  }

  findAll() {
    return this.repository.find({ where: { estado: true } as any });
  }

  findOne(id: number) {
    return this.repository.findOne({ where: { id } as any });
  }

  update(id: number, updateAccionDto: UpdateAccionDto) {
    return this.repository.update(id, updateAccionDto);
  }

  remove(id: number) {
    // Borrado lógico (DDL v8): estado = 'F'
    return this.repository.update(id, { estado: false } as any);
  }
}

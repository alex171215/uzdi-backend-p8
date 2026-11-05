import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSesionDto } from './dto/create-sesion.dto';
import { UpdateSesionDto } from './dto/update-sesion.dto';
import { Sesion } from './entities/sesion.entity';

@Injectable()
export class SesionService {
  constructor(
    @InjectRepository(Sesion)
    private readonly repository: Repository<Sesion>,
  ) {}

  create(createSesionDto: CreateSesionDto) {
    const newEntity = this.repository.create(createSesionDto);
    return this.repository.save(newEntity);
  }

  findAll() {
    return this.repository.find();
  }

  findOne(id: number) {
    return this.repository.findOne({ where: { id } as any });
  }

  update(id: number, updateSesionDto: UpdateSesionDto) {
    return this.repository.update(id, updateSesionDto);
  }

  remove(id: number) {
    return this.repository.delete(id);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateHistorialDto } from './dto/create-historial.dto';
import { UpdateHistorialDto } from './dto/update-historial.dto';
import { Historial } from './entities/historial.entity';

@Injectable()
export class HistorialService {
  constructor(
    @InjectRepository(Historial)
    private readonly repository: Repository<Historial>,
  ) {}

  create(createHistorialDto: CreateHistorialDto) {
    const newEntity = this.repository.create(createHistorialDto);
    return this.repository.save(newEntity);
  }

  findAll() {
    return this.repository.find();
  }

  findOne(id: number) {
    return this.repository.findOne({ where: { id } as any });
  }

  update(id: number, updateHistorialDto: UpdateHistorialDto) {
    return this.repository.update(id, updateHistorialDto);
  }

  remove(id: number) {
    return this.repository.delete(id);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEstadoCivilDto } from './dto/create-estado-civil.dto';
import { UpdateEstadoCivilDto } from './dto/update-estado-civil.dto';
import { EstadoCivil } from './entities/estado-civil.entity';

@Injectable()
export class EstadoCivilService {
  constructor(
    @InjectRepository(EstadoCivil)
    private readonly repository: Repository<EstadoCivil>,
  ) {}

  create(createEstadoCivilDto: CreateEstadoCivilDto) {
    const newEntity = this.repository.create(createEstadoCivilDto);
    return this.repository.save(newEntity);
  }

  findAll() {
    return this.repository.find();
  }

  findOne(id: number) {
    return this.repository.findOne({ where: { id } as any });
  }

  update(id: number, updateEstadoCivilDto: UpdateEstadoCivilDto) {
    return this.repository.update(id, updateEstadoCivilDto);
  }

  remove(id: number) {
    return this.repository.delete(id);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProvinciaDto } from './dto/create-provincia.dto';
import { UpdateProvinciaDto } from './dto/update-provincia.dto';
import { Provincia } from './entities/provincia.entity';

@Injectable()
export class ProvinciaService {
  constructor(
    @InjectRepository(Provincia)
    private readonly repository: Repository<Provincia>,
  ) {}

  create(createProvinciaDto: CreateProvinciaDto) {
    const newEntity = this.repository.create(createProvinciaDto);
    return this.repository.save(newEntity);
  }

  findAll() {
    return this.repository.find();
  }

  findOne(id: number) {
    return this.repository.findOne({ where: { id } as any });
  }

  update(id: number, updateProvinciaDto: UpdateProvinciaDto) {
    return this.repository.update(id, updateProvinciaDto);
  }

  remove(id: number) {
    return this.repository.delete(id);
  }
}

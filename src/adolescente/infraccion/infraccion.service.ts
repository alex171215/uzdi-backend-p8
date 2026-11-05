import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInfraccionDto } from './dto/create-infraccion.dto';
import { UpdateInfraccionDto } from './dto/update-infraccion.dto';
import { Infraccion } from './entities/infraccion.entity';

@Injectable()
export class InfraccionService {
  constructor(
    @InjectRepository(Infraccion)
    private readonly repository: Repository<Infraccion>,
  ) {}

  create(createInfraccionDto: CreateInfraccionDto) {
    const newEntity = this.repository.create(createInfraccionDto);
    return this.repository.save(newEntity);
  }

  findAll() {
    return this.repository.find();
  }

  findOne(id: number) {
    return this.repository.findOne({ where: { id } as any });
  }

  update(id: number, updateInfraccionDto: UpdateInfraccionDto) {
    return this.repository.update(id, updateInfraccionDto);
  }

  remove(id: number) {
    return this.repository.delete(id);
  }
}

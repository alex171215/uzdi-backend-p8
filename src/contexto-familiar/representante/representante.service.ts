import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRepresentanteDto } from './dto/create-representante.dto';
import { UpdateRepresentanteDto } from './dto/update-representante.dto';
import { Representante } from './entities/representante.entity';

@Injectable()
export class RepresentanteService {
  constructor(
    @InjectRepository(Representante)
    private readonly repository: Repository<Representante>,
  ) {}

  create(createRepresentanteDto: CreateRepresentanteDto) {
    const newEntity = this.repository.create(createRepresentanteDto);
    return this.repository.save(newEntity);
  }

  findAll() {
    return this.repository.find();
  }

  findOne(id: number) {
    return this.repository.findOne({ where: { id } as any });
  }

  update(id: number, updateRepresentanteDto: UpdateRepresentanteDto) {
    return this.repository.update(id, updateRepresentanteDto);
  }

  remove(id: number) {
    return this.repository.delete(id);
  }
}

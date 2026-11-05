import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEtniaDto } from './dto/create-etnia.dto';
import { UpdateEtniaDto } from './dto/update-etnia.dto';
import { Etnia } from './entities/etnia.entity';

@Injectable()
export class EtniaService {
  constructor(
    @InjectRepository(Etnia)
    private readonly repository: Repository<Etnia>,
  ) {}

  create(createEtniaDto: CreateEtniaDto) {
    const newEntity = this.repository.create(createEtniaDto);
    return this.repository.save(newEntity);
  }

  findAll() {
    return this.repository.find();
  }

  findOne(id: number) {
    return this.repository.findOne({ where: { id } as any });
  }

  update(id: number, updateEtniaDto: UpdateEtniaDto) {
    return this.repository.update(id, updateEtniaDto);
  }

  remove(id: number) {
    return this.repository.delete(id);
  }
}

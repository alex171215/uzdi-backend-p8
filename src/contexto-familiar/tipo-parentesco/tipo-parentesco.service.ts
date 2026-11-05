import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTipoParentescoDto } from './dto/create-tipo-parentesco.dto';
import { UpdateTipoParentescoDto } from './dto/update-tipo-parentesco.dto';
import { TipoParentesco } from './entities/tipo-parentesco.entity';

@Injectable()
export class TipoParentescoService {
  constructor(
    @InjectRepository(TipoParentesco)
    private readonly repository: Repository<TipoParentesco>,
  ) {}

  create(createTipoParentescoDto: CreateTipoParentescoDto) {
    const newEntity = this.repository.create(createTipoParentescoDto);
    return this.repository.save(newEntity);
  }

  findAll() {
    return this.repository.find();
  }

  findOne(id: number) {
    return this.repository.findOne({ where: { id } as any });
  }

  update(id: number, updateTipoParentescoDto: UpdateTipoParentescoDto) {
    return this.repository.update(id, updateTipoParentescoDto);
  }

  remove(id: number) {
    return this.repository.delete(id);
  }
}

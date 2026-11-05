import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateGdoDto } from './dto/create-gdo.dto';
import { UpdateGdoDto } from './dto/update-gdo.dto';
import { Gdo } from './entities/gdo.entity';

@Injectable()
export class GdoService {
  constructor(
    @InjectRepository(Gdo)
    private readonly repository: Repository<Gdo>,
  ) {}

  create(createGdoDto: CreateGdoDto) {
    const newEntity = this.repository.create(createGdoDto);
    return this.repository.save(newEntity);
  }

  findAll() {
    return this.repository.find();
  }

  findOne(id: number) {
    return this.repository.findOne({ where: { id } as any });
  }

  update(id: number, updateGdoDto: UpdateGdoDto) {
    return this.repository.update(id, updateGdoDto);
  }

  remove(id: number) {
    return this.repository.delete(id);
  }
}

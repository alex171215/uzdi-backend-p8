import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUzdiDto } from './dto/create-uzdi.dto';
import { UpdateUzdiDto } from './dto/update-uzdi.dto';
import { Uzdi } from './entities/uzdi.entity';

@Injectable()
export class UzdiService {
  constructor(
    @InjectRepository(Uzdi)
    private readonly repository: Repository<Uzdi>,
  ) {}

  create(createUzdiDto: CreateUzdiDto) {
    const newEntity = this.repository.create(createUzdiDto);
    return this.repository.save(newEntity);
  }

  findAll() {
    return this.repository.find();
  }

  findOne(id: number) {
    return this.repository.findOne({ where: { id } as any });
  }

  update(id: number, updateUzdiDto: UpdateUzdiDto) {
    return this.repository.update(id, updateUzdiDto);
  }

  remove(id: number) {
    return this.repository.delete(id);
  }
}

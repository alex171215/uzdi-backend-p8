import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCantonDto } from './dto/create-canton.dto';
import { UpdateCantonDto } from './dto/update-canton.dto';
import { Canton } from './entities/canton.entity';

@Injectable()
export class CantonService {
  constructor(
    @InjectRepository(Canton)
    private readonly repository: Repository<Canton>,
  ) {}

  create(createCantonDto: CreateCantonDto) {
    const newEntity = this.repository.create(createCantonDto);
    return this.repository.save(newEntity);
  }

  findAll() {
    return this.repository.find();
  }

  findOne(id: number) {
    return this.repository.findOne({ where: { id } as any });
  }

  update(id: number, updateCantonDto: UpdateCantonDto) {
    return this.repository.update(id, updateCantonDto);
  }

  remove(id: number) {
    return this.repository.delete(id);
  }
}

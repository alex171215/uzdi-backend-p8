import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTallerDto } from './dto/create-taller.dto';
import { UpdateTallerDto } from './dto/update-taller.dto';
import { Taller } from './entities/taller.entity';

@Injectable()
export class TallerService {
  constructor(
    @InjectRepository(Taller)
    private readonly repository: Repository<Taller>,
  ) {}

  create(createTallerDto: CreateTallerDto) {
    const newEntity = this.repository.create(createTallerDto);
    return this.repository.save(newEntity);
  }

  findAll() {
    return this.repository.find();
  }

  findOne(id: number) {
    return this.repository.findOne({ where: { id } as any });
  }

  update(id: number, updateTallerDto: UpdateTallerDto) {
    return this.repository.update(id, updateTallerDto);
  }

  remove(id: number) {
    return this.repository.delete(id);
  }
}

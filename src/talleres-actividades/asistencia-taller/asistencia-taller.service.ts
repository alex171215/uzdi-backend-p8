import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAsistenciaTallerDto } from './dto/create-asistencia-taller.dto';
import { UpdateAsistenciaTallerDto } from './dto/update-asistencia-taller.dto';
import { AsistenciaTaller } from './entities/asistencia-taller.entity';

@Injectable()
export class AsistenciaTallerService {
  constructor(
    @InjectRepository(AsistenciaTaller)
    private readonly repository: Repository<AsistenciaTaller>,
  ) {}

  create(createAsistenciaTallerDto: CreateAsistenciaTallerDto) {
    const newEntity = this.repository.create(createAsistenciaTallerDto);
    return this.repository.save(newEntity);
  }

  findAll() {
    return this.repository.find();
  }

  findOne(id: number) {
    return this.repository.findOne({ where: { id } as any });
  }

  update(id: number, updateAsistenciaTallerDto: UpdateAsistenciaTallerDto) {
    return this.repository.update(id, updateAsistenciaTallerDto);
  }

  remove(id: number) {
    return this.repository.delete(id);
  }
}

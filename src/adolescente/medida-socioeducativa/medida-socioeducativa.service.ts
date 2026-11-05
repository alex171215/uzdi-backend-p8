import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMedidaSocioeducativaDto } from './dto/create-medida-socioeducativa.dto';
import { UpdateMedidaSocioeducativaDto } from './dto/update-medida-socioeducativa.dto';
import { MedidaSocioeducativa } from './entities/medida-socioeducativa.entity';

@Injectable()
export class MedidaSocioeducativaService {
  constructor(
    @InjectRepository(MedidaSocioeducativa)
    private readonly repository: Repository<MedidaSocioeducativa>,
  ) {}

  create(createMedidaSocioeducativaDto: CreateMedidaSocioeducativaDto) {
    const newEntity = this.repository.create(createMedidaSocioeducativaDto);
    return this.repository.save(newEntity);
  }

  findAll() {
    return this.repository.find();
  }

  findOne(id: number) {
    return this.repository.findOne({ where: { id } as any });
  }

  update(id: number, updateMedidaSocioeducativaDto: UpdateMedidaSocioeducativaDto) {
    return this.repository.update(id, updateMedidaSocioeducativaDto);
  }

  remove(id: number) {
    return this.repository.delete(id);
  }
}

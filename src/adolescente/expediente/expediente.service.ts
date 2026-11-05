import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateExpedienteDto } from './dto/create-expediente.dto';
import { UpdateExpedienteDto } from './dto/update-expediente.dto';
import { Expediente } from './entities/expediente.entity';

@Injectable()
export class ExpedienteService {
  constructor(
    @InjectRepository(Expediente)
    private readonly repository: Repository<Expediente>,
  ) {}

  create(createExpedienteDto: CreateExpedienteDto) {
    const newEntity = this.repository.create(createExpedienteDto);
    return this.repository.save(newEntity);
  }

  findAll() {
    return this.repository.find();
  }

  findOne(id: number) {
    return this.repository.findOne({ where: { id } as any });
  }

  update(id: number, updateExpedienteDto: UpdateExpedienteDto) {
    return this.repository.update(id, updateExpedienteDto);
  }

  remove(id: number) {
    return this.repository.delete(id);
  }
}

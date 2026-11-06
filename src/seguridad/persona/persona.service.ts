import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { Persona } from './entities/persona.entity';

@Injectable()
export class PersonaService {
  constructor(
    @InjectRepository(Persona)
    private readonly repository: Repository<Persona>,
  ) {}

  create(createPersonaDto: CreatePersonaDto) {
    const newEntity = this.repository.create(createPersonaDto);
    return this.repository.save(newEntity);
  }

  findAll() {
    return this.repository.find({ where: { estado: true } as any });
  }

  findOne(id: number) {
    return this.repository.findOne({ where: { id } as any });
  }

  update(id: number, updatePersonaDto: UpdatePersonaDto) {
    return this.repository.update(id, updatePersonaDto);
  }

  remove(id: number) {
    // Borrado lógico (DDL v8): estado = 'F'
    return this.repository.update(id, { estado: false } as any);
  }
}

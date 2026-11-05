import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAdolescenteDto } from './dto/create-adolescente.dto';
import { UpdateAdolescenteDto } from './dto/update-adolescente.dto';
import { Adolescente } from './entities/adolescente.entity';

@Injectable()
export class AdolescenteService {
  constructor(
    @InjectRepository(Adolescente)
    private readonly repository: Repository<Adolescente>,
  ) {}

  create(createAdolescenteDto: CreateAdolescenteDto) {
    const newEntity = this.repository.create(createAdolescenteDto);
    return this.repository.save(newEntity);
  }

  findAll() {
    return this.repository.find();
  }

  findOne(id: number) {
    return this.repository.findOne({ where: { id } as any });
  }

  update(id: number, updateAdolescenteDto: UpdateAdolescenteDto) {
    return this.repository.update(id, updateAdolescenteDto);
  }

  remove(id: number) {
    return this.repository.delete(id);
  }
}

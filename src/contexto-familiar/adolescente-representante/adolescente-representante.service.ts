import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAdolescenteRepresentanteDto } from './dto/create-adolescente-representante.dto';
import { UpdateAdolescenteRepresentanteDto } from './dto/update-adolescente-representante.dto';
import { AdolescenteRepresentante } from './entities/adolescente-representante.entity';

@Injectable()
export class AdolescenteRepresentanteService {
  constructor(
    @InjectRepository(AdolescenteRepresentante)
    private readonly repository: Repository<AdolescenteRepresentante>,
  ) {}

  create(createAdolescenteRepresentanteDto: CreateAdolescenteRepresentanteDto) {
    const newEntity = this.repository.create(createAdolescenteRepresentanteDto);
    return this.repository.save(newEntity);
  }

  findAll() {
    return this.repository.find();
  }

  findOne(id: number) {
    return this.repository.findOne({ where: { id } as any });
  }

  update(id: number, updateAdolescenteRepresentanteDto: UpdateAdolescenteRepresentanteDto) {
    return this.repository.update(id, updateAdolescenteRepresentanteDto);
  }

  remove(id: number) {
    return this.repository.delete(id);
  }
}

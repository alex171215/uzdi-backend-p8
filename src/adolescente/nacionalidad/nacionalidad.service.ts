import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNacionalidadDto } from './dto/create-nacionalidad.dto';
import { UpdateNacionalidadDto } from './dto/update-nacionalidad.dto';
import { Nacionalidad } from './entities/nacionalidad.entity';

@Injectable()
export class NacionalidadService {
  constructor(
    @InjectRepository(Nacionalidad)
    private readonly repository: Repository<Nacionalidad>,
  ) {}

  create(createNacionalidadDto: CreateNacionalidadDto) {
    const newEntity = this.repository.create(createNacionalidadDto);
    return this.repository.save(newEntity);
  }

  findAll() {
    return this.repository.find();
  }

  findOne(id: number) {
    return this.repository.findOne({ where: { id } as any });
  }

  update(id: number, updateNacionalidadDto: UpdateNacionalidadDto) {
    return this.repository.update(id, updateNacionalidadDto);
  }

  remove(id: number) {
    return this.repository.delete(id);
  }
}

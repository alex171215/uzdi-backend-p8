import { Injectable, NotFoundException } from '@nestjs/common';
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
    return this.repository.find({ where: { estado: true } });
  }

  findOne(id: number) {
    return this.repository.findOne({ where: { id, estado: true } });
  }

  async update(id: number, updateNacionalidadDto: UpdateNacionalidadDto) {
    const result = await this.repository.update(
      { id, estado: true },
      updateNacionalidadDto,
    );
    if (!result.affected)
      throw new NotFoundException('Nacionalidad activa no encontrada');
    return result;
  }

  async remove(id: number) {
    const result = await this.repository.update(
      { id, estado: true },
      { estado: false },
    );
    if (!result.affected)
      throw new NotFoundException('Nacionalidad activa no encontrada');
    return result;
  }
}

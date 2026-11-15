import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEstadoCivilDto } from './dto/create-estado-civil.dto';
import { UpdateEstadoCivilDto } from './dto/update-estado-civil.dto';
import { EstadoCivil } from './entities/estado-civil.entity';

@Injectable()
export class EstadoCivilService {
  constructor(
    @InjectRepository(EstadoCivil)
    private readonly repository: Repository<EstadoCivil>,
  ) {}

  create(createEstadoCivilDto: CreateEstadoCivilDto) {
    const newEntity = this.repository.create(createEstadoCivilDto);
    return this.repository.save(newEntity);
  }

  findAll() {
    return this.repository.find({ where: { estado: true } });
  }

  async findOne(id: number) {
    const entity = await this.repository.findOne({
      where: { id, estado: true },
    });
    if (!entity)
      throw new NotFoundException('Estado civil activo no encontrado');
    return entity;
  }

  async update(id: number, updateEstadoCivilDto: UpdateEstadoCivilDto) {
    const result = await this.repository.update(
      { id, estado: true },
      updateEstadoCivilDto,
    );
    if (!result.affected)
      throw new NotFoundException('Estado civil activo no encontrado');
    return result;
  }

  async remove(id: number) {
    const result = await this.repository.update(
      { id, estado: true },
      { estado: false },
    );
    if (!result.affected)
      throw new NotFoundException('Estado civil activo no encontrado');
    return result;
  }
}

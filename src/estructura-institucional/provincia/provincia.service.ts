import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProvinciaDto } from './dto/create-provincia.dto';
import { UpdateProvinciaDto } from './dto/update-provincia.dto';
import { Provincia } from './entities/provincia.entity';

@Injectable()
export class ProvinciaService {
  constructor(
    @InjectRepository(Provincia)
    private readonly repository: Repository<Provincia>,
  ) {}

  create(createProvinciaDto: CreateProvinciaDto) {
    const newEntity = this.repository.create(createProvinciaDto);
    return this.repository.save(newEntity);
  }

  findAll() {
    return this.repository.find({ where: { estado: true } });
  }

  findOne(id: number) {
    return this.repository.findOne({ where: { id, estado: true } });
  }

  async update(id: number, updateProvinciaDto: UpdateProvinciaDto) {
    const result = await this.repository.update(
      { id, estado: true },
      updateProvinciaDto,
    );
    if (!result.affected)
      throw new NotFoundException('Provincia activa no encontrada');
    return result;
  }

  async remove(id: number) {
    const result = await this.repository.update(
      { id, estado: true },
      { estado: false },
    );
    if (!result.affected)
      throw new NotFoundException('Provincia activa no encontrada');
    return result;
  }
}

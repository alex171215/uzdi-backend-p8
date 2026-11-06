import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEtniaDto } from './dto/create-etnia.dto';
import { UpdateEtniaDto } from './dto/update-etnia.dto';
import { Etnia } from './entities/etnia.entity';

@Injectable()
export class EtniaService {
  constructor(
    @InjectRepository(Etnia)
    private readonly repository: Repository<Etnia>,
  ) {}

  create(createEtniaDto: CreateEtniaDto) {
    const newEntity = this.repository.create(createEtniaDto);
    return this.repository.save(newEntity);
  }

  findAll() {
    return this.repository.find({ where: { estado: true } });
  }

  findOne(id: number) {
    return this.repository.findOne({ where: { id, estado: true } });
  }

  async update(id: number, updateEtniaDto: UpdateEtniaDto) {
    const result = await this.repository.update(
      { id, estado: true },
      updateEtniaDto,
    );
    if (!result.affected)
      throw new NotFoundException('Etnia activa no encontrada');
    return result;
  }

  async remove(id: number) {
    const result = await this.repository.update(
      { id, estado: true },
      { estado: false },
    );
    if (!result.affected)
      throw new NotFoundException('Etnia activa no encontrada');
    return result;
  }
}

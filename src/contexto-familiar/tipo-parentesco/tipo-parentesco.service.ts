import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTipoParentescoDto } from './dto/create-tipo-parentesco.dto';
import { UpdateTipoParentescoDto } from './dto/update-tipo-parentesco.dto';
import { TipoParentesco } from './entities/tipo-parentesco.entity';

@Injectable()
export class TipoParentescoService {
  constructor(
    @InjectRepository(TipoParentesco)
    private readonly repository: Repository<TipoParentesco>,
  ) {}

  async create(createTipoParentescoDto: CreateTipoParentescoDto) {
    const newEntity = this.repository.create(createTipoParentescoDto);
    return this.repository.save(newEntity);
  }

  async findAll() {
    return this.repository.find({
      where: { estado: true },
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: number) {
    const item = await this.repository.findOne({ where: { id, estado: true } });
    if (!item) {
      throw new NotFoundException('Tipo de parentesco activo no encontrado');
    }
    return item;
  }

  async update(id: number, updateTipoParentescoDto: UpdateTipoParentescoDto) {
    const result = await this.repository.update(
      { id, estado: true },
      updateTipoParentescoDto,
    );
    if (!result.affected) {
      throw new NotFoundException('Tipo de parentesco activo no encontrado');
    }
    return this.findOne(id);
  }

  async remove(id: number) {
    const result = await this.repository.update(
      { id, estado: true },
      { estado: false },
    );
    if (!result.affected) {
      throw new NotFoundException('Tipo de parentesco activo no encontrado');
    }
    return { message: 'Tipo de parentesco inactivado correctamente' };
  }
}

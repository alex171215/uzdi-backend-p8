import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTipoDocumentoDto } from './dto/create-tipo-documento.dto';
import { UpdateTipoDocumentoDto } from './dto/update-tipo-documento.dto';
import { TipoDocumento } from './entities/tipo-documento.entity';

@Injectable()
export class TipoDocumentoService {
  constructor(
    @InjectRepository(TipoDocumento)
    private readonly repository: Repository<TipoDocumento>,
  ) {}

  async create(createTipoDocumentoDto: CreateTipoDocumentoDto) {
    const newEntity = this.repository.create(createTipoDocumentoDto);
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
      throw new NotFoundException('Tipo de documento activo no encontrado');
    }
    return item;
  }

  async update(id: number, updateTipoDocumentoDto: UpdateTipoDocumentoDto) {
    const result = await this.repository.update(
      { id, estado: true },
      updateTipoDocumentoDto,
    );
    if (!result.affected) {
      throw new NotFoundException('Tipo de documento activo no encontrado');
    }
    return this.findOne(id);
  }

  async remove(id: number) {
    const result = await this.repository.update(
      { id, estado: true },
      { estado: false },
    );
    if (!result.affected) {
      throw new NotFoundException('Tipo de documento activo no encontrado');
    }
    return { message: 'Tipo de documento inactivado correctamente' };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateGdoDto } from './dto/create-gdo.dto';
import { UpdateGdoDto } from './dto/update-gdo.dto';
import { Gdo } from './entities/gdo.entity';

@Injectable()
export class GdoService {
  constructor(
    @InjectRepository(Gdo)
    private readonly repository: Repository<Gdo>,
  ) {}

  create(createGdoDto: CreateGdoDto) {
    const newEntity = this.repository.create(createGdoDto);
    return this.repository.save(newEntity);
  }

  findAll() {
    return this.repository.find({ where: { estado: true } });
  }

  findOne(id: number) {
    return this.repository.findOne({ where: { id, estado: true } });
  }

  async update(id: number, updateGdoDto: UpdateGdoDto) {
    const result = await this.repository.update(
      { id, estado: true },
      updateGdoDto,
    );
    if (!result.affected)
      throw new NotFoundException('GDO activo no encontrado');
    return result;
  }

  async remove(id: number) {
    const result = await this.repository.update(
      { id, estado: true },
      { estado: false },
    );
    if (!result.affected)
      throw new NotFoundException('GDO activo no encontrado');
    return result;
  }
}

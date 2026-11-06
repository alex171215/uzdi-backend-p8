import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCantonDto } from './dto/create-canton.dto';
import { UpdateCantonDto } from './dto/update-canton.dto';
import { Canton } from './entities/canton.entity';
import { Provincia } from '../provincia/entities/provincia.entity';

@Injectable()
export class CantonService {
  constructor(
    @InjectRepository(Canton)
    private readonly repository: Repository<Canton>,
    @InjectRepository(Provincia)
    private readonly provinciaRepository: Repository<Provincia>,
  ) {}

  async create(createCantonDto: CreateCantonDto) {
    await this.assertProvinciaActiva(createCantonDto.prov_id);
    const newEntity = this.repository.create(createCantonDto);
    return this.repository.save(newEntity);
  }

  findAll(provId?: number) {
    return this.repository.find({
      where: {
        estado: true,
        provincia: { estado: true },
        ...(provId ? { prov_id: provId } : {}),
      },
    });
  }

  findOne(id: number) {
    return this.repository.findOne({
      where: { id, estado: true, provincia: { estado: true } },
    });
  }

  async update(id: number, updateCantonDto: UpdateCantonDto) {
    if (updateCantonDto.prov_id !== undefined)
      await this.assertProvinciaActiva(updateCantonDto.prov_id);
    const result = await this.repository.update(
      { id, estado: true },
      updateCantonDto,
    );
    if (!result.affected)
      throw new NotFoundException('Cantón activo no encontrado');
    return result;
  }

  async remove(id: number) {
    const result = await this.repository.update(
      { id, estado: true },
      { estado: false },
    );
    if (!result.affected)
      throw new NotFoundException('Cantón activo no encontrado');
    return result;
  }

  private async assertProvinciaActiva(id: number) {
    if (!(await this.provinciaRepository.existsBy({ id, estado: true }))) {
      throw new NotFoundException('Provincia activa no encontrada');
    }
  }
}

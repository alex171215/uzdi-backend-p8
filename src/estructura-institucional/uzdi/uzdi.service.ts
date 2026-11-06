import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUzdiDto } from './dto/create-uzdi.dto';
import { UpdateUzdiDto } from './dto/update-uzdi.dto';
import { Uzdi } from './entities/uzdi.entity';
import { Canton } from '../canton/entities/canton.entity';

@Injectable()
export class UzdiService {
  constructor(
    @InjectRepository(Uzdi)
    private readonly repository: Repository<Uzdi>,
    @InjectRepository(Canton)
    private readonly cantonRepository: Repository<Canton>,
  ) {}

  async create(createUzdiDto: CreateUzdiDto) {
    await this.assertCantonActivo(createUzdiDto.cntn_id);
    const newEntity = this.repository.create(createUzdiDto);
    return this.repository.save(newEntity);
  }

  findAll(cntnId?: number) {
    return this.repository.find({
      where: {
        estado: true,
        canton: { estado: true, provincia: { estado: true } },
        ...(cntnId ? { cntn_id: cntnId } : {}),
      },
    });
  }

  findOne(id: number) {
    return this.repository.findOne({
      where: {
        id,
        estado: true,
        canton: { estado: true, provincia: { estado: true } },
      },
    });
  }

  async update(id: number, updateUzdiDto: UpdateUzdiDto) {
    if (updateUzdiDto.cntn_id !== undefined)
      await this.assertCantonActivo(updateUzdiDto.cntn_id);
    const result = await this.repository.update(
      { id, estado: true },
      updateUzdiDto,
    );
    if (!result.affected)
      throw new NotFoundException('UZDI activa no encontrada');
    return result;
  }

  async remove(id: number) {
    const result = await this.repository.update(
      { id, estado: true },
      { estado: false },
    );
    if (!result.affected)
      throw new NotFoundException('UZDI activa no encontrada');
    return result;
  }

  private async assertCantonActivo(id: number) {
    if (
      !(await this.cantonRepository.existsBy({
        id,
        estado: true,
        provincia: { estado: true },
      }))
    ) {
      throw new NotFoundException('Cantón activo no encontrado');
    }
  }
}

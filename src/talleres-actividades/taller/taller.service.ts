import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTallerDto } from './dto/create-taller.dto';
import { UpdateTallerDto } from './dto/update-taller.dto';
import { Taller } from './entities/taller.entity';
import { Uzdi } from '../../estructura-institucional/uzdi/entities/uzdi.entity';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class TallerService {
  constructor(
    @InjectRepository(Taller)
    private readonly repository: Repository<Taller>,
    @InjectRepository(Uzdi)
    private readonly uzdiRepository: Repository<Uzdi>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private validarHoras(horaInicio: string, horaFin: string) {
    if (horaFin <= horaInicio) {
      throw new BadRequestException(
        'La hora de finalización debe ser estrictamente posterior a la hora de inicio',
      );
    }
  }

  async create(createTallerDto: CreateTallerDto) {
    this.validarHoras(createTallerDto.hora_inicio, createTallerDto.hora_fin);

    const uzdi = await this.uzdiRepository.findOne({
      where: { id: createTallerDto.uzdi_id, estado: true },
    });
    if (!uzdi) {
      throw new NotFoundException('La sede UZDI especificada no existe o está inactiva');
    }

    const responsable = await this.userRepository.findOne({
      where: { id: createTallerDto.prsn_id, estado: true },
    });
    if (!responsable) {
      throw new NotFoundException('El profesional responsable especificado no existe o está inactivo');
    }

    const newEntity = this.repository.create(createTallerDto);
    return this.repository.save(newEntity);
  }

  async findAll() {
    return this.repository.find({
      where: { estado: true },
      order: { fecha: 'DESC', hora_inicio: 'ASC' },
    });
  }

  async findOne(id: number) {
    const item = await this.repository.findOne({
      where: { id, estado: true },
    });
    if (!item) {
      throw new NotFoundException('Taller activo no encontrado');
    }
    return item;
  }

  async update(id: number, updateTallerDto: UpdateTallerDto) {
    const item = await this.findOne(id);

    const hInicio = updateTallerDto.hora_inicio ?? item.hora_inicio;
    const hFin = updateTallerDto.hora_fin ?? item.hora_fin;
    this.validarHoras(hInicio, hFin);

    if (updateTallerDto.uzdi_id && updateTallerDto.uzdi_id !== item.uzdi_id) {
      const uzdi = await this.uzdiRepository.findOne({
        where: { id: updateTallerDto.uzdi_id, estado: true },
      });
      if (!uzdi) {
        throw new NotFoundException('La sede UZDI especificada no existe o está inactiva');
      }
    }

    if (updateTallerDto.prsn_id && updateTallerDto.prsn_id !== item.prsn_id) {
      const responsable = await this.userRepository.findOne({
        where: { id: updateTallerDto.prsn_id, estado: true },
      });
      if (!responsable) {
        throw new NotFoundException('El responsable especificado no existe o está inactivo');
      }
    }

    await this.repository.update({ id, estado: true }, updateTallerDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const result = await this.repository.update(
      { id, estado: true },
      { estado: false },
    );
    if (!result.affected) {
      throw new NotFoundException('Taller activo no encontrado');
    }
    return { message: 'Taller inactivado correctamente' };
  }
}

import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAdolescenteRepresentanteDto } from './dto/create-adolescente-representante.dto';
import { UpdateAdolescenteRepresentanteDto } from './dto/update-adolescente-representante.dto';
import { AdolescenteRepresentante } from './entities/adolescente-representante.entity';
import { Adolescente } from '../../adolescente/adolescente/entities/adolescente.entity';
import { Representante } from '../representante/entities/representante.entity';
import { TipoParentesco } from '../tipo-parentesco/entities/tipo-parentesco.entity';

@Injectable()
export class AdolescenteRepresentanteService {
  constructor(
    @InjectRepository(AdolescenteRepresentante)
    private readonly repository: Repository<AdolescenteRepresentante>,
    @InjectRepository(Adolescente)
    private readonly adolescenteRepository: Repository<Adolescente>,
    @InjectRepository(Representante)
    private readonly representanteRepository: Repository<Representante>,
    @InjectRepository(TipoParentesco)
    private readonly parentescoRepository: Repository<TipoParentesco>,
  ) {}

  async create(createDto: CreateAdolescenteRepresentanteDto) {
    if (
      createDto.fecha_inicio &&
      createDto.fecha_fin &&
      createDto.fecha_fin < createDto.fecha_inicio
    ) {
      throw new BadRequestException(
        'La fecha de finalización no puede ser anterior a la fecha de inicio',
      );
    }

    const adolescente = await this.adolescenteRepository.findOne({
      where: { id: createDto.adlc_id, estado: true },
    });
    if (!adolescente) {
      throw new NotFoundException('Adolescente especificado no existe o está inactivo');
    }

    const representante = await this.representanteRepository.findOne({
      where: { id: createDto.repr_id, estado: true },
    });
    if (!representante) {
      throw new NotFoundException(
        'Representante legal especificado no existe o está inactivo',
      );
    }

    const parentesco = await this.parentescoRepository.findOne({
      where: { id: createDto.tprt_id, estado: true },
    });
    if (!parentesco) {
      throw new NotFoundException('Tipo de parentesco especificado no existe o está inactivo');
    }

    const vinculoExistente = await this.repository.findOne({
      where: {
        adlc_id: createDto.adlc_id,
        repr_id: createDto.repr_id,
        estado: true,
      },
    });
    if (vinculoExistente) {
      throw new ConflictException(
        'El adolescente ya tiene un vínculo activo con este representante',
      );
    }

    const newEntity = this.repository.create({
      ...createDto,
      es_referente: createDto.es_referente ?? false,
    });
    return this.repository.save(newEntity);
  }

  async findAll() {
    return this.repository.find({
      where: { estado: true },
    });
  }

  async findByAdolescente(adlc_id: number) {
    return this.repository.find({
      where: { adlc_id, estado: true },
    });
  }

  async findOne(id: number) {
    const item = await this.repository.findOne({
      where: { id, estado: true },
    });
    if (!item) {
      throw new NotFoundException('Vínculo adolescente-representante no encontrado');
    }
    return item;
  }

  async update(id: number, updateDto: UpdateAdolescenteRepresentanteDto) {
    const item = await this.findOne(id);

    const fInicio = updateDto.fecha_inicio ?? item.fecha_inicio;
    const fFin = updateDto.fecha_fin ?? item.fecha_fin;
    if (fInicio && fFin && fFin < fInicio) {
      throw new BadRequestException(
        'La fecha de finalización no puede ser anterior a la fecha de inicio',
      );
    }

    if (updateDto.tprt_id && updateDto.tprt_id !== item.tprt_id) {
      const parentesco = await this.parentescoRepository.findOne({
        where: { id: updateDto.tprt_id, estado: true },
      });
      if (!parentesco) {
        throw new NotFoundException('Tipo de parentesco especificado no existe');
      }
    }

    await this.repository.update({ id, estado: true }, updateDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const result = await this.repository.update(
      { id, estado: true },
      { estado: false },
    );
    if (!result.affected) {
      throw new NotFoundException('Vínculo adolescente-representante no encontrado');
    }
    return { message: 'Vínculo adolescente-representante inactivado correctamente' };
  }
}

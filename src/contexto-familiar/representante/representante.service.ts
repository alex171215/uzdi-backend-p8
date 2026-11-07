import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRepresentanteDto } from './dto/create-representante.dto';
import { UpdateRepresentanteDto } from './dto/update-representante.dto';
import { Representante } from './entities/representante.entity';
import { Canton } from '../../estructura-institucional/canton/entities/canton.entity';

@Injectable()
export class RepresentanteService {
  constructor(
    @InjectRepository(Representante)
    private readonly repository: Repository<Representante>,
    @InjectRepository(Canton)
    private readonly cantonRepository: Repository<Canton>,
  ) {}

  async create(createRepresentanteDto: CreateRepresentanteDto) {
    const canton = await this.cantonRepository.findOne({
      where: { id: createRepresentanteDto.cntn_id, estado: true },
    });
    if (!canton) {
      throw new NotFoundException('El cantón especificado no existe o está inactivo');
    }

    const existeCedula = await this.repository.findOne({
      where: { cedula: createRepresentanteDto.cedula, estado: true },
    });
    if (existeCedula) {
      throw new ConflictException(
        `Ya existe un representante activo registrado con la cédula ${createRepresentanteDto.cedula}`,
      );
    }

    const newEntity = this.repository.create(createRepresentanteDto);
    return this.repository.save(newEntity);
  }

  async findAll() {
    return this.repository.find({
      where: { estado: true },
      order: { apellido: 'ASC', nombre: 'ASC' },
    });
  }

  async findOne(id: number) {
    const item = await this.repository.findOne({
      where: { id, estado: true },
    });
    if (!item) {
      throw new NotFoundException('Representante activo no encontrado');
    }
    return item;
  }

  async findByCedula(cedula: string) {
    const item = await this.repository.findOne({
      where: { cedula, estado: true },
    });
    if (!item) {
      throw new NotFoundException(
        `Representante activo con cédula ${cedula} no encontrado`,
      );
    }
    return item;
  }

  async update(id: number, updateRepresentanteDto: UpdateRepresentanteDto) {
    const item = await this.findOne(id);

    if (
      updateRepresentanteDto.cntn_id &&
      updateRepresentanteDto.cntn_id !== item.cntn_id
    ) {
      const canton = await this.cantonRepository.findOne({
        where: { id: updateRepresentanteDto.cntn_id, estado: true },
      });
      if (!canton) {
        throw new NotFoundException('El cantón especificado no existe o está inactivo');
      }
    }

    if (
      updateRepresentanteDto.cedula &&
      updateRepresentanteDto.cedula !== item.cedula
    ) {
      const duplicado = await this.repository.findOne({
        where: { cedula: updateRepresentanteDto.cedula, estado: true },
      });
      if (duplicado && duplicado.id !== id) {
        throw new ConflictException(
          `La cédula ${updateRepresentanteDto.cedula} ya se encuentra registrada en otro representante`,
        );
      }
    }

    await this.repository.update({ id, estado: true }, updateRepresentanteDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const result = await this.repository.update(
      { id, estado: true },
      { estado: false },
    );
    if (!result.affected) {
      throw new NotFoundException('Representante activo no encontrado');
    }
    return { message: 'Representante inactivado correctamente' };
  }
}

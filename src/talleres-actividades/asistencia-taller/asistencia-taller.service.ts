import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAsistenciaTallerDto } from './dto/create-asistencia-taller.dto';
import { UpdateAsistenciaTallerDto } from './dto/update-asistencia-taller.dto';
import { AsistenciaTaller } from './entities/asistencia-taller.entity';
import { Taller } from '../taller/entities/taller.entity';
import { Adolescente } from '../../adolescente/adolescente/entities/adolescente.entity';
import { AdolescenteRepresentante } from '../../contexto-familiar/adolescente-representante/entities/adolescente-representante.entity';

@Injectable()
export class AsistenciaTallerService {
  constructor(
    @InjectRepository(AsistenciaTaller)
    private readonly repository: Repository<AsistenciaTaller>,
    @InjectRepository(Taller)
    private readonly tallerRepository: Repository<Taller>,
    @InjectRepository(Adolescente)
    private readonly adolescenteRepository: Repository<Adolescente>,
    @InjectRepository(AdolescenteRepresentante)
    private readonly adreRepository: Repository<AdolescenteRepresentante>,
  ) {}

  /**
   * Valida la restricción estricta de base de datos (chk_asistencia_taller_asistente):
   * - Si tipo_asistente = 'adolescente': adlc_id DEBE estar presente y adre_id DEBE ser nulo.
   * - Si tipo_asistente = 'representante': adre_id DEBE estar presente y adlc_id DEBE ser nulo.
   */
  private validarRestriccionAsistente(
    tipo: 'adolescente' | 'representante',
    adlc_id?: number | null,
    adre_id?: number | null,
  ) {
    if (tipo === 'adolescente') {
      if (!adlc_id) {
        throw new BadRequestException(
          'Para tipo_asistente "adolescente", se debe proporcionar adlc_id obligatorio.',
        );
      }
      if (adre_id) {
        throw new BadRequestException(
          'Para tipo_asistente "adolescente", adre_id debe ser nulo.',
        );
      }
    } else if (tipo === 'representante') {
      if (!adre_id) {
        throw new BadRequestException(
          'Para tipo_asistente "representante", se debe proporcionar adre_id obligatorio (vínculo de adolescente_representante).',
        );
      }
      if (adlc_id) {
        throw new BadRequestException(
          'Para tipo_asistente "representante", adlc_id debe ser nulo.',
        );
      }
    } else {
      throw new BadRequestException(
        'El tipo_asistente debe ser estrictamente "adolescente" o "representante".',
      );
    }
  }

  async create(createDto: CreateAsistenciaTallerDto) {
    this.validarRestriccionAsistente(
      createDto.tipo_asistente,
      createDto.adlc_id,
      createDto.adre_id,
    );

    const taller = await this.tallerRepository.findOne({
      where: { id: createDto.tall_id, estado: true },
    });
    if (!taller) {
      throw new NotFoundException('El taller especificado no existe o está inactivo');
    }

    if (createDto.tipo_asistente === 'adolescente' && createDto.adlc_id) {
      const adolescente = await this.adolescenteRepository.findOne({
        where: { id: createDto.adlc_id, estado: true },
      });
      if (!adolescente) {
        throw new NotFoundException('El adolescente especificado no existe o está inactivo');
      }
    }

    if (createDto.tipo_asistente === 'representante' && createDto.adre_id) {
      const adre = await this.adreRepository.findOne({
        where: { id: createDto.adre_id, estado: true },
      });
      if (!adre) {
        throw new NotFoundException(
          'El vínculo de adolescente_representante no existe o está inactivo',
        );
      }
    }

    const newEntity = this.repository.create({
      ...createDto,
      asistio: createDto.asistio ?? false,
    });
    return this.repository.save(newEntity);
  }

  async findAll() {
    return this.repository.find({
      where: { estado: true },
    });
  }

  async findByTaller(tall_id: number) {
    return this.repository.find({
      where: { tall_id, estado: true },
    });
  }

  async findOne(id: number) {
    const item = await this.repository.findOne({
      where: { id, estado: true },
    });
    if (!item) {
      throw new NotFoundException('Registro de asistencia a taller no encontrado');
    }
    return item;
  }

  async update(id: number, updateDto: UpdateAsistenciaTallerDto) {
    const item = await this.findOne(id);

    const nuevoTipo = updateDto.tipo_asistente ?? item.tipo_asistente;
    const nuevoAdlc =
      updateDto.adlc_id !== undefined ? updateDto.adlc_id : item.adlc_id;
    const nuevoAdre =
      updateDto.adre_id !== undefined ? updateDto.adre_id : item.adre_id;

    this.validarRestriccionAsistente(nuevoTipo, nuevoAdlc, nuevoAdre);

    await this.repository.update({ id, estado: true }, updateDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const result = await this.repository.update(
      { id, estado: true },
      { estado: false },
    );
    if (!result.affected) {
      throw new NotFoundException('Registro de asistencia no encontrado');
    }
    return { message: 'Registro de asistencia inactivado correctamente' };
  }
}

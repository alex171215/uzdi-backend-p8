import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateExpedienteDto } from './dto/create-expediente.dto';
import { UpdateExpedienteDto } from './dto/update-expediente.dto';
import { QueryExpedienteDto } from './dto/query-expediente.dto';
import { Expediente } from './entities/expediente.entity';
import { Infraccion } from '../infraccion/entities/infraccion.entity';

@Injectable()
export class ExpedienteService {
  constructor(
    @InjectRepository(Expediente)
    private readonly repository: Repository<Expediente>,
    @InjectRepository(Infraccion)
    private readonly infraccionRepo: Repository<Infraccion>,
  ) {}

  // la infraccion tiene que existir y estar activa
  private async validarInfraccion(infcId: number) {
    const infraccion = await this.infraccionRepo.findOne({
      where: { id: infcId },
    });
    if (!infraccion)
      throw new BadRequestException(
        `La infracción (infc_id=${infcId}) no existe.`,
      );
    if (!infraccion.estado)
      throw new BadRequestException(
        `La infracción "${infraccion.nombre}" está inactiva.`,
      );
  }

  // el numero de causa es opcional, pero no se puede repetir en otro expediente activo
  private async validarNumeroCausa(
    numeroCausa: string | undefined,
    excludeId?: number,
  ) {
    if (!numeroCausa) return;
    const existente = await this.repository.findOne({
      where: { numero_causa: numeroCausa, estado: true },
    });
    if (existente && existente.id !== excludeId) {
      throw new ConflictException(
        `Ya existe un expediente activo con el número de causa ${numeroCausa}.`,
      );
    }
  }

  async create(dto: CreateExpedienteDto) {
    await this.validarInfraccion(dto.infc_id);
    await this.validarNumeroCausa(dto.numero_causa);
    const entity = this.repository.create(dto);
    return this.repository.save(entity);
  }

  findAll(query: QueryExpedienteDto = {}) {
    const where: any = { estado: true };
    if (query?.adlc_id !== undefined && query?.adlc_id !== null && (query.adlc_id as any) !== '') {
      const val = Number(query.adlc_id);
      if (!isNaN(val)) where.adlc_id = val;
    }
    if (query?.infc_id !== undefined && query?.infc_id !== null && (query.infc_id as any) !== '') {
      const val = Number(query.infc_id);
      if (!isNaN(val)) where.infc_id = val;
    }
    if (query?.uzdi_id !== undefined && query?.uzdi_id !== null && (query.uzdi_id as any) !== '') {
      const val = Number(query.uzdi_id);
      if (!isNaN(val)) where.uzdi_id = val;
    }
    return this.repository.find({
      where,
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number) {
    const expediente = await this.repository.findOne({
      where: { id },
      relations: { medidas: { medida: true } },
      order: { medidas: { orden: 'ASC' } },
    });
    if (!expediente)
      throw new NotFoundException(`Expediente ${id} no encontrado.`);
    return expediente;
  }

  async update(id: number, dto: UpdateExpedienteDto) {
    await this.findOne(id);
    if (dto.infc_id) await this.validarInfraccion(dto.infc_id);
    await this.validarNumeroCausa(dto.numero_causa, id);
    await this.repository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    // borrado logico: solo se cambia el estado a 'F'
    await this.repository.update(id, { estado: false });
    return { id, estado: false };
  }
}

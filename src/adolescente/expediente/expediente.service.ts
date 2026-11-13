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
import { Adolescente } from '../adolescente/entities/adolescente.entity';
import { Uzdi } from '../../estructura-institucional/uzdi/entities/uzdi.entity';

// Servicio con la logica de negocio para causas judiciales y medidas
@Injectable()
export class ExpedienteService {
  constructor(
    @InjectRepository(Expediente)
    private readonly repository: Repository<Expediente>,
    @InjectRepository(Infraccion)
    private readonly infraccionRepo: Repository<Infraccion>,
    @InjectRepository(Adolescente)
    private readonly adolescenteRepo: Repository<Adolescente>,
    @InjectRepository(Uzdi)
    private readonly uzdiRepo: Repository<Uzdi>,
  ) {}

  // Validamos que el menor exista en la BD y se encuentre activo
  private async validarAdolescente(adlcId: number) {
    const adolescente = await this.adolescenteRepo.findOne({
      where: { id: adlcId },
    });
    if (!adolescente) {
      throw new BadRequestException(`El adolescente (adlc_id=${adlcId}) no existe.`);
    }
    if (!adolescente.estado) {
      throw new BadRequestException(`El adolescente (adlc_id=${adlcId}) se encuentra inactivo.`);
    }
  }

  // Validamos que la sede UZDI exista y este habilitada
  private async validarUzdi(uzdiId: number) {
    const uzdi = await this.uzdiRepo.findOne({ where: { id: uzdiId } });
    if (!uzdi) {
      throw new BadRequestException(`La sede UZDI (uzdi_id=${uzdiId}) no existe.`);
    }
    if (!uzdi.estado) {
      throw new BadRequestException(`La sede UZDI "${uzdi.nombre}" esta inactiva.`);
    }
  }

  // Validamos que la infraccion asignada exista y este activa
  private async validarInfraccion(infcId: number) {
    const infraccion = await this.infraccionRepo.findOne({
      where: { id: infcId },
    });
    if (!infraccion) {
      throw new BadRequestException(`La infracción (infc_id=${infcId}) no existe.`);
    }
    if (!infraccion.estado) {
      throw new BadRequestException(`La infracción "${infraccion.nombre}" está inactiva.`);
    }
  }

  // Controlamos que no se duplique el numero de causa en expedientes activos
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

  // Registramos un expediente validando integridad referencial y unicidad de causa
  async create(dto: CreateExpedienteDto) {
    await this.validarAdolescente(dto.adlc_id);
    await this.validarUzdi(dto.uzdi_id);
    await this.validarInfraccion(dto.infc_id);
    await this.validarNumeroCausa(dto.numero_causa);
    const entity = this.repository.create(dto);
    return this.repository.save(entity);
  }

  // Listamos expedientes activos limpiando cualquier parametro nulo o vacio
  findAll(query: QueryExpedienteDto = {}) {
    const where: any = { estado: true };
    if (query.adlc_id && Number(query.adlc_id) > 0) {
      where.adlc_id = Number(query.adlc_id);
    }
    if (query.infc_id && Number(query.infc_id) > 0) {
      where.infc_id = Number(query.infc_id);
    }
    if (query.uzdi_id && Number(query.uzdi_id) > 0) {
      where.uzdi_id = Number(query.uzdi_id);
    }
    return this.repository.find({
      where,
      order: { id: 'DESC' },
    });
  }

  // Obtenemos un expediente con sus medidas socioeducativas ordenadas
  async findOne(id: number) {
    const expediente = await this.repository.findOne({
      where: { id },
      relations: { medidas: { medida: true } },
      order: { medidas: { orden: 'ASC' } },
    });
    if (!expediente) {
      throw new NotFoundException(`Expediente ${id} no encontrado.`);
    }
    return expediente;
  }

  // Modificamos datos del expediente respetando las reglas de validacion
  async update(id: number, dto: UpdateExpedienteDto) {
    await this.findOne(id);
    if (dto.adlc_id) await this.validarAdolescente(dto.adlc_id);
    if (dto.uzdi_id) await this.validarUzdi(dto.uzdi_id);
    if (dto.infc_id) await this.validarInfraccion(dto.infc_id);
    await this.validarNumeroCausa(dto.numero_causa, id);
    await this.repository.update(id, dto);
    return this.findOne(id);
  }

  // Desactivamos el expediente de forma logica sin borrar el registro
  async remove(id: number) {
    await this.findOne(id);
    await this.repository.update(id, { estado: false });
    return { id, estado: false };
  }
}

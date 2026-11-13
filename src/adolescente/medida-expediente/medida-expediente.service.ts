import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMedidaExpedienteDto } from './dto/create-medida-expediente.dto';
import { UpdateMedidaExpedienteDto } from './dto/update-medida-expediente.dto';
import { QueryMedidaExpedienteDto } from './dto/query-medida-expediente.dto';
import { MedidaExpediente } from './entities/medida-expediente.entity';
import { Expediente } from '../expediente/entities/expediente.entity';
import { MedidaSocioeducativa } from '../medida-socioeducativa/entities/medida-socioeducativa.entity';

@Injectable()
export class MedidaExpedienteService {
  constructor(
    @InjectRepository(MedidaExpediente)
    private readonly repository: Repository<MedidaExpediente>,
    @InjectRepository(Expediente)
    private readonly expedienteRepo: Repository<Expediente>,
    @InjectRepository(MedidaSocioeducativa)
    private readonly medidaRepo: Repository<MedidaSocioeducativa>,
  ) {}

  private async validarExpediente(expeId: number) {
    const expediente = await this.expedienteRepo.findOne({
      where: { id: expeId },
    });
    if (!expediente)
      throw new BadRequestException(
        `El expediente (expe_id=${expeId}) no existe.`,
      );
    if (!expediente.estado)
      throw new BadRequestException(`El expediente ${expeId} está inactivo.`);
  }

  private async validarMedida(mdsoId: number) {
    const medida = await this.medidaRepo.findOne({ where: { id: mdsoId } });
    if (!medida)
      throw new BadRequestException(
        `La medida socioeducativa (mdso_id=${mdsoId}) no existe.`,
      );
    if (!medida.estado)
      throw new BadRequestException(
        `La medida "${medida.nombre}" está inactiva.`,
      );
  }

  // misma regla que el CHECK de la BD: la fecha fin no puede ser antes que la de inicio
  private validarFechas(inicio: string, fin?: string | null) {
    if (fin && new Date(fin) < new Date(inicio)) {
      throw new BadRequestException(
        'fecha_fin no puede ser anterior a fecha_inicio.',
      );
    }
  }

  async create(dto: CreateMedidaExpedienteDto) {
    await this.validarExpediente(dto.expe_id);
    await this.validarMedida(dto.mdso_id);
    this.validarFechas(dto.fecha_inicio, dto.fecha_fin);
    const entity = this.repository.create(dto);
    const saved = await this.repository.save(entity);
    return this.findOne(saved.id);
  }

  // Listamos las medidas activas filtrando solo parametros con valores validos
  findAll(query: QueryMedidaExpedienteDto = {}) {
    const where: any = { estado: true };
    if (query.expe_id && Number(query.expe_id) > 0) {
      where.expe_id = Number(query.expe_id);
    }
    if (query.mdso_id && Number(query.mdso_id) > 0) {
      where.mdso_id = Number(query.mdso_id);
    }
    return this.repository.find({
      where,
      order: { expe_id: 'ASC', orden: 'ASC', fecha_inicio: 'ASC' },
    });
  }

  async findOne(id: number) {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity)
      throw new NotFoundException(`Medida de expediente ${id} no encontrada.`);
    return entity;
  }

  async update(id: number, dto: UpdateMedidaExpedienteDto) {
    const actual = await this.findOne(id);
    if (dto.mdso_id) await this.validarMedida(dto.mdso_id);
    this.validarFechas(
      dto.fecha_inicio ?? actual.fecha_inicio,
      dto.fecha_fin ?? actual.fecha_fin,
    );
    await this.repository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    // borrado logico: solo se cambia el estado a false
    await this.repository.update(id, { estado: false });
    return { id, estado: false };
  }
}

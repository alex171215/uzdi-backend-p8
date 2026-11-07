import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDocumentoExpedienteDto } from './dto/create-documento-expediente.dto';
import { UpdateDocumentoExpedienteDto } from './dto/update-documento-expediente.dto';
import { DocumentoExpediente } from './entities/documento-expediente.entity';
import { Expediente } from '../../adolescente/expediente/entities/expediente.entity';
import { User } from '../../users/entities/user.entity';
import { TipoDocumento } from '../tipo-documento/entities/tipo-documento.entity';

@Injectable()
export class DocumentoExpedienteService {
  constructor(
    @InjectRepository(DocumentoExpediente)
    private readonly repository: Repository<DocumentoExpediente>,
    @InjectRepository(Expediente)
    private readonly expedienteRepository: Repository<Expediente>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(TipoDocumento)
    private readonly tipoDocumentoRepository: Repository<TipoDocumento>,
  ) {}

  async create(createDto: CreateDocumentoExpedienteDto) {
    const expediente = await this.expedienteRepository.findOne({
      where: { id: createDto.expe_id, estado: true },
    });
    if (!expediente) {
      throw new NotFoundException('El expediente especificado no existe o está inactivo');
    }

    const responsable = await this.userRepository.findOne({
      where: { id: createDto.prsn_id, estado: true },
    });
    if (!responsable) {
      throw new NotFoundException('El responsable especificado no existe o está inactivo');
    }

    const tipoDoc = await this.tipoDocumentoRepository.findOne({
      where: { id: createDto.tpdc_id, estado: true },
    });
    if (!tipoDoc) {
      throw new NotFoundException('El tipo de documento especificado no existe o está inactivo');
    }

    const newEntity = this.repository.create({
      ...createDto,
      es_habilitante: createDto.es_habilitante ?? false,
      estado_tramite: createDto.estado_tramite ?? 'pendiente',
    });
    return this.repository.save(newEntity);
  }

  async findAll() {
    return this.repository.find({
      where: { estado: true },
      order: { fecha_registro: 'DESC' },
    });
  }

  async findByExpediente(expe_id: number) {
    return this.repository.find({
      where: { expe_id, estado: true },
      order: { fecha_registro: 'DESC' },
    });
  }

  async findOne(id: number) {
    const item = await this.repository.findOne({
      where: { id, estado: true },
    });
    if (!item) {
      throw new NotFoundException('Documento de expediente no encontrado');
    }
    return item;
  }

  async update(id: number, updateDto: UpdateDocumentoExpedienteDto) {
    await this.findOne(id);

    if (updateDto.expe_id) {
      const expediente = await this.expedienteRepository.findOne({
        where: { id: updateDto.expe_id, estado: true },
      });
      if (!expediente) {
        throw new NotFoundException('El expediente especificado no existe o está inactivo');
      }
    }

    if (updateDto.prsn_id) {
      const responsable = await this.userRepository.findOne({
        where: { id: updateDto.prsn_id, estado: true },
      });
      if (!responsable) {
        throw new NotFoundException('El responsable especificado no existe o está inactivo');
      }
    }

    if (updateDto.tpdc_id) {
      const tipoDoc = await this.tipoDocumentoRepository.findOne({
        where: { id: updateDto.tpdc_id, estado: true },
      });
      if (!tipoDoc) {
        throw new NotFoundException('El tipo de documento especificado no existe o está inactivo');
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
      throw new NotFoundException('Documento de expediente no encontrado');
    }
    return { message: 'Documento de expediente inactivado correctamente' };
  }
}

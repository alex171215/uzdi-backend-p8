import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDocumentoExpedienteDto } from './dto/create-documento-expediente.dto';
import { UpdateDocumentoExpedienteDto } from './dto/update-documento-expediente.dto';
import { DocumentoExpediente } from './entities/documento-expediente.entity';

@Injectable()
export class DocumentoExpedienteService {
  constructor(
    @InjectRepository(DocumentoExpediente)
    private readonly repository: Repository<DocumentoExpediente>,
  ) {}

  create(createDocumentoExpedienteDto: CreateDocumentoExpedienteDto) {
    const newEntity = this.repository.create(createDocumentoExpedienteDto);
    return this.repository.save(newEntity);
  }

  findAll() {
    return this.repository.find();
  }

  findOne(id: number) {
    return this.repository.findOne({ where: { id } as any });
  }

  update(id: number, updateDocumentoExpedienteDto: UpdateDocumentoExpedienteDto) {
    return this.repository.update(id, updateDocumentoExpedienteDto);
  }

  remove(id: number) {
    return this.repository.delete(id);
  }
}

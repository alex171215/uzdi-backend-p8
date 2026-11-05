import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTipoDocumentoDto } from './dto/create-tipo-documento.dto';
import { UpdateTipoDocumentoDto } from './dto/update-tipo-documento.dto';
import { TipoDocumento } from './entities/tipo-documento.entity';

@Injectable()
export class TipoDocumentoService {
  constructor(
    @InjectRepository(TipoDocumento)
    private readonly repository: Repository<TipoDocumento>,
  ) {}

  create(createTipoDocumentoDto: CreateTipoDocumentoDto) {
    const newEntity = this.repository.create(createTipoDocumentoDto);
    return this.repository.save(newEntity);
  }

  findAll() {
    return this.repository.find();
  }

  findOne(id: number) {
    return this.repository.findOne({ where: { id } as any });
  }

  update(id: number, updateTipoDocumentoDto: UpdateTipoDocumentoDto) {
    return this.repository.update(id, updateTipoDocumentoDto);
  }

  remove(id: number) {
    return this.repository.delete(id);
  }
}

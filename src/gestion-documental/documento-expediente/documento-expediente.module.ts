import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentoExpedienteService } from './documento-expediente.service';
import { DocumentoExpedienteController } from './documento-expediente.controller';
import { DocumentoExpediente } from './entities/documento-expediente.entity';
import { Expediente } from '../../adolescente/expediente/entities/expediente.entity';
import { User } from '../../users/entities/user.entity';
import { TipoDocumento } from '../tipo-documento/entities/tipo-documento.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DocumentoExpediente,
      Expediente,
      User,
      TipoDocumento,
    ]),
  ],
  controllers: [DocumentoExpedienteController],
  providers: [DocumentoExpedienteService],
  exports: [DocumentoExpedienteService],
})
export class DocumentoExpedienteModule {}

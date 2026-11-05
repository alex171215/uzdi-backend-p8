import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentoExpedienteService } from './documento-expediente.service';
import { DocumentoExpedienteController } from './documento-expediente.controller';
import { DocumentoExpediente } from './entities/documento-expediente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentoExpediente])],
  controllers: [DocumentoExpedienteController],
  providers: [DocumentoExpedienteService],
  exports: [DocumentoExpedienteService]
})
export class DocumentoExpedienteModule {}

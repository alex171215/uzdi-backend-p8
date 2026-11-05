import { Module } from '@nestjs/common';
import { TipoDocumentoModule } from './tipo-documento/tipo-documento.module';
import { DocumentoExpedienteModule } from './documento-expediente/documento-expediente.module';

@Module({
  imports: [
    TipoDocumentoModule,
    DocumentoExpedienteModule,
  ]
})
export class GestionDocumentalModule {}

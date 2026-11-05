import { Module } from '@nestjs/common';
import { TipoParentescoModule } from './tipo-parentesco/tipo-parentesco.module';
import { RepresentanteModule } from './representante/representante.module';
import { AdolescenteRepresentanteModule } from './adolescente-representante/adolescente-representante.module';

@Module({
  imports: [
    TipoParentescoModule,
    RepresentanteModule,
    AdolescenteRepresentanteModule,
  ]
})
export class ContextoFamiliarModule {}

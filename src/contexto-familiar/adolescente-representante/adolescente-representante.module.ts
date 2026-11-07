import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdolescenteRepresentanteService } from './adolescente-representante.service';
import { AdolescenteRepresentanteController } from './adolescente-representante.controller';
import { AdolescenteRepresentante } from './entities/adolescente-representante.entity';
import { Adolescente } from '../../adolescente/adolescente/entities/adolescente.entity';
import { Representante } from '../representante/entities/representante.entity';
import { TipoParentesco } from '../tipo-parentesco/entities/tipo-parentesco.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AdolescenteRepresentante,
      Adolescente,
      Representante,
      TipoParentesco,
    ]),
  ],
  controllers: [AdolescenteRepresentanteController],
  providers: [AdolescenteRepresentanteService],
  exports: [AdolescenteRepresentanteService],
})
export class AdolescenteRepresentanteModule {}

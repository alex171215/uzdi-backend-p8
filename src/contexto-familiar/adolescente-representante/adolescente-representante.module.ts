import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdolescenteRepresentanteService } from './adolescente-representante.service';
import { AdolescenteRepresentanteController } from './adolescente-representante.controller';
import { AdolescenteRepresentante } from './entities/adolescente-representante.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AdolescenteRepresentante])],
  controllers: [AdolescenteRepresentanteController],
  providers: [AdolescenteRepresentanteService],
  exports: [AdolescenteRepresentanteService]
})
export class AdolescenteRepresentanteModule {}

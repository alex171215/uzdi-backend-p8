import { Module } from '@nestjs/common';
import { NacionalidadModule } from './nacionalidad/nacionalidad.module';
import { EstadoCivilModule } from './estado-civil/estado-civil.module';
import { EtniaModule } from './etnia/etnia.module';
import { GdoModule } from './gdo/gdo.module';
import { InfraccionModule } from './infraccion/infraccion.module';
import { MedidaSocioeducativaModule } from './medida-socioeducativa/medida-socioeducativa.module';
import { AdolescenteModule } from './adolescente/adolescente.module';
import { ExpedienteModule } from './expediente/expediente.module';
import { MedidaExpedienteModule } from './medida-expediente/medida-expediente.module';

@Module({
  imports: [
    NacionalidadModule,
    EstadoCivilModule,
    EtniaModule,
    GdoModule,
    InfraccionModule,
    MedidaSocioeducativaModule,
    AdolescenteModule,
    ExpedienteModule,
    MedidaExpedienteModule,
  ],
})
export class AdolescentesModule {}

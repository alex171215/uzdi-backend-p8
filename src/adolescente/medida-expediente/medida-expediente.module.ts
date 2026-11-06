import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedidaExpedienteService } from './medida-expediente.service';
import { MedidaExpedienteController } from './medida-expediente.controller';
import { MedidaExpediente } from './entities/medida-expediente.entity';
import { Expediente } from '../expediente/entities/expediente.entity';
import { MedidaSocioeducativa } from '../medida-socioeducativa/entities/medida-socioeducativa.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MedidaExpediente,
      Expediente,
      MedidaSocioeducativa,
    ]),
  ],
  controllers: [MedidaExpedienteController],
  providers: [MedidaExpedienteService],
  exports: [MedidaExpedienteService],
})
export class MedidaExpedienteModule {}

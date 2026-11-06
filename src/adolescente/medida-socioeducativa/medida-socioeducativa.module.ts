import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedidaSocioeducativaService } from './medida-socioeducativa.service';
import { MedidaSocioeducativaController } from './medida-socioeducativa.controller';
import { MedidaSocioeducativa } from './entities/medida-socioeducativa.entity';
import { MedidaExpediente } from '../medida-expediente/entities/medida-expediente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MedidaSocioeducativa, MedidaExpediente])],
  controllers: [MedidaSocioeducativaController],
  providers: [MedidaSocioeducativaService],
  exports: [MedidaSocioeducativaService],
})
export class MedidaSocioeducativaModule {}

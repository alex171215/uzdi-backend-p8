import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedidaSocioeducativaService } from './medida-socioeducativa.service';
import { MedidaSocioeducativaController } from './medida-socioeducativa.controller';
import { MedidaSocioeducativa } from './entities/medida-socioeducativa.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MedidaSocioeducativa])],
  controllers: [MedidaSocioeducativaController],
  providers: [MedidaSocioeducativaService],
  exports: [MedidaSocioeducativaService]
})
export class MedidaSocioeducativaModule {}

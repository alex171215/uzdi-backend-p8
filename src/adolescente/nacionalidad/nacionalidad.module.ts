import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NacionalidadService } from './nacionalidad.service';
import { NacionalidadController } from './nacionalidad.controller';
import { Nacionalidad } from './entities/nacionalidad.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Nacionalidad])],
  controllers: [NacionalidadController],
  providers: [NacionalidadService],
  exports: [NacionalidadService]
})
export class NacionalidadModule {}

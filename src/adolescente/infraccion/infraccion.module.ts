import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InfraccionService } from './infraccion.service';
import { InfraccionController } from './infraccion.controller';
import { Infraccion } from './entities/infraccion.entity';
import { Expediente } from '../expediente/entities/expediente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Infraccion, Expediente])],
  controllers: [InfraccionController],
  providers: [InfraccionService],
  exports: [InfraccionService],
})
export class InfraccionModule {}

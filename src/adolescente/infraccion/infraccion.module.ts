import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InfraccionService } from './infraccion.service';
import { InfraccionController } from './infraccion.controller';
import { Infraccion } from './entities/infraccion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Infraccion])],
  controllers: [InfraccionController],
  providers: [InfraccionService],
  exports: [InfraccionService]
})
export class InfraccionModule {}

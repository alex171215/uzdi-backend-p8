import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SesionService } from './sesion.service';
import { SesionController } from './sesion.controller';
import { Sesion } from './entities/sesion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sesion])],
  controllers: [SesionController],
  providers: [SesionService],
  exports: [SesionService]
})
export class SesionModule {}

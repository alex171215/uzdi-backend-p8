import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccionService } from './accion.service';
import { AccionController } from './accion.controller';
import { Accion } from './entities/accion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Accion])],
  controllers: [AccionController],
  providers: [AccionService],
  exports: [AccionService]
})
export class AccionModule {}

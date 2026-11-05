import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RepresentanteService } from './representante.service';
import { RepresentanteController } from './representante.controller';
import { Representante } from './entities/representante.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Representante])],
  controllers: [RepresentanteController],
  providers: [RepresentanteService],
  exports: [RepresentanteService]
})
export class RepresentanteModule {}

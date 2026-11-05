import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EtniaService } from './etnia.service';
import { EtniaController } from './etnia.controller';
import { Etnia } from './entities/etnia.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Etnia])],
  controllers: [EtniaController],
  providers: [EtniaService],
  exports: [EtniaService]
})
export class EtniaModule {}

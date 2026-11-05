import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GdoService } from './gdo.service';
import { GdoController } from './gdo.controller';
import { Gdo } from './entities/gdo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Gdo])],
  controllers: [GdoController],
  providers: [GdoService],
  exports: [GdoService]
})
export class GdoModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoParentescoService } from './tipo-parentesco.service';
import { TipoParentescoController } from './tipo-parentesco.controller';
import { TipoParentesco } from './entities/tipo-parentesco.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TipoParentesco])],
  controllers: [TipoParentescoController],
  providers: [TipoParentescoService],
  exports: [TipoParentescoService]
})
export class TipoParentescoModule {}

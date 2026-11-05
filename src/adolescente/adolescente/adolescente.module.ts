import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdolescenteService } from './adolescente.service';
import { AdolescenteController } from './adolescente.controller';
import { Adolescente } from './entities/adolescente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Adolescente])],
  controllers: [AdolescenteController],
  providers: [AdolescenteService],
  exports: [AdolescenteService]
})
export class AdolescenteModule {}

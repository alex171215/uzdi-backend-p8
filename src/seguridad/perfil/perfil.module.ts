import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerfilService } from './perfil.service';
import { PerfilController } from './perfil.controller';
import { Perfil } from './entities/perfil.entity';
import { Permiso } from '../permiso/entities/permiso.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Perfil, Permiso])],
  controllers: [PerfilController],
  providers: [PerfilService],
  exports: [PerfilService],
})
export class PerfilModule {}

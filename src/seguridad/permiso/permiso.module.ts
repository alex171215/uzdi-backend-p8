import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermisoService } from './permiso.service';
import { PermisoController } from './permiso.controller';
import { Permiso } from './entities/permiso.entity';
import { Perfil } from '../perfil/entities/perfil.entity';
import { Accion } from '../accion/entities/accion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Permiso, Perfil, Accion])],
  controllers: [PermisoController],
  providers: [PermisoService],
  exports: [PermisoService],
})
export class PermisoModule {}

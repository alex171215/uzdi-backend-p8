import { Module } from '@nestjs/common';
import { PerfilModule } from './perfil/perfil.module';
import { AccionModule } from './accion/accion.module';
import { PermisoModule } from './permiso/permiso.module';
import { PersonaModule } from './persona/persona.module';
import { SesionModule } from './sesion/sesion.module';
import { HistorialModule } from './historial/historial.module';
import { RbacModule } from './rbac/rbac.module';

@Module({
  imports: [
    RbacModule,
    PerfilModule,
    AccionModule,
    PermisoModule,
    PersonaModule,
    SesionModule,
    HistorialModule,
  ],
  exports: [RbacModule],
})
export class SeguridadModule {}

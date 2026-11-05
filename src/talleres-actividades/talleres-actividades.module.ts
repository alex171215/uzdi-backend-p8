import { Module } from '@nestjs/common';
import { TallerModule } from './taller/taller.module';
import { AsistenciaTallerModule } from './asistencia-taller/asistencia-taller.module';

@Module({
  imports: [
    TallerModule,
    AsistenciaTallerModule,
  ]
})
export class TalleresActividadesModule {}

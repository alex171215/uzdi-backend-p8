import { Module } from '@nestjs/common';
import { ProvinciaModule } from './provincia/provincia.module';
import { CantonModule } from './canton/canton.module';
import { UzdiModule } from './uzdi/uzdi.module';

@Module({
  imports: [
    ProvinciaModule,
    CantonModule,
    UzdiModule,
  ]
})
export class EstructuraInstitucionalModule {}

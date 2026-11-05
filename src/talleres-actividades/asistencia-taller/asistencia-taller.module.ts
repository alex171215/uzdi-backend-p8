import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsistenciaTallerService } from './asistencia-taller.service';
import { AsistenciaTallerController } from './asistencia-taller.controller';
import { AsistenciaTaller } from './entities/asistencia-taller.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AsistenciaTaller])],
  controllers: [AsistenciaTallerController],
  providers: [AsistenciaTallerService],
  exports: [AsistenciaTallerService]
})
export class AsistenciaTallerModule {}

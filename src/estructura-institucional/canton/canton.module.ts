import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CantonService } from './canton.service';
import { CantonController } from './canton.controller';
import { Canton } from './entities/canton.entity';
import { Provincia } from '../provincia/entities/provincia.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Canton, Provincia])],
  controllers: [CantonController],
  providers: [CantonService],
  exports: [CantonService],
})
export class CantonModule {}

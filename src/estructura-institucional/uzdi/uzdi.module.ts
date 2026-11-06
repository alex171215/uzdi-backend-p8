import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UzdiService } from './uzdi.service';
import { UzdiController } from './uzdi.controller';
import { Uzdi } from './entities/uzdi.entity';
import { Canton } from '../canton/entities/canton.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Uzdi, Canton])],
  controllers: [UzdiController],
  providers: [UzdiService],
  exports: [UzdiService],
})
export class UzdiModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TallerService } from './taller.service';
import { TallerController } from './taller.controller';
import { Taller } from './entities/taller.entity';
import { Uzdi } from '../../estructura-institucional/uzdi/entities/uzdi.entity';
import { User } from '../../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Taller, Uzdi, User])],
  controllers: [TallerController],
  providers: [TallerService],
  exports: [TallerService],
})
export class TallerModule {}

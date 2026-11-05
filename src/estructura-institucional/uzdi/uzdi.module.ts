import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UzdiService } from './uzdi.service';
import { UzdiController } from './uzdi.controller';
import { Uzdi } from './entities/uzdi.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Uzdi])],
  controllers: [UzdiController],
  providers: [UzdiService],
  exports: [UzdiService]
})
export class UzdiModule {}

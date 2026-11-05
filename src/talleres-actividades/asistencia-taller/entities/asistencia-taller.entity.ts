import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AsistenciaTaller {
  @PrimaryGeneratedColumn()
  id: number;
}

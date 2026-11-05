import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Taller {
  @PrimaryGeneratedColumn()
  id: number;
}

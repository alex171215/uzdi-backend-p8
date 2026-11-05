import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Historial {
  @PrimaryGeneratedColumn()
  id: number;
}

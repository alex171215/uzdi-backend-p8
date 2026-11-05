import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Accion {
  @PrimaryGeneratedColumn()
  id: number;
}

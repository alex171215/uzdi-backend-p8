import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Sesion {
  @PrimaryGeneratedColumn()
  id: number;
}

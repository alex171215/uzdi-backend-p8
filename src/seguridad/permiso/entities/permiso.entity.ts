import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Permiso {
  @PrimaryGeneratedColumn()
  id: number;
}

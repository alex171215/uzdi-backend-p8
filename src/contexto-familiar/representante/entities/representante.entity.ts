import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Representante {
  @PrimaryGeneratedColumn()
  id: number;
}

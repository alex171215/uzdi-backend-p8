import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AdolescenteRepresentante {
  @PrimaryGeneratedColumn()
  id: number;
}

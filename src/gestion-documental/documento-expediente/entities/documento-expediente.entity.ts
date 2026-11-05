import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class DocumentoExpediente {
  @PrimaryGeneratedColumn()
  id: number;
}

import { ValueTransformer } from 'typeorm';

/**
 * Convierte los campos booleanos de la aplicación a la representación CHAR(1)
 * 'V'/'F' que exige el DDL (constraints CHECK (... IN ('V','F'))).
 * La API expone/recibe booleanos; la base guarda 'V' o 'F'.
 */
export const BooleanVF: ValueTransformer = {
  to: (value?: boolean | null): string => (value ? 'V' : 'F'),
  from: (value?: string | null): boolean => value === 'V',
};

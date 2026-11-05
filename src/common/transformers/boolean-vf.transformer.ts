import { ValueTransformer } from 'typeorm';

/**
 * Convierte los campos booleanos de la aplicación a la representación CHAR(1)
 * 'V'/'F' que exige el DDL v8 (constraints CHECK (... IN ('V','F'))).
 * 
 * - En la aplicación (TypeScript / JSON): se utiliza `true` / `false`.
 * - En la base de datos (PostgreSQL): se almacena 'V' (Verdadero / Activo) o 'F' (Falso / Inactivo).
 */
export const BooleanVF: ValueTransformer = {
  to: (value?: boolean | null): string => {
    if (value === null || value === undefined) return 'V';
    return value ? 'V' : 'F';
  },
  from: (value?: string | null): boolean => value === 'V',
};

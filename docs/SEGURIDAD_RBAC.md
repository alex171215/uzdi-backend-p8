# Seguridad ER CAI y Matriz RBAC — Backend UZDI

**Responsable:** Alejandro Flores · Tareas 5.2, 5.3 y 5.4

## 1. Modelo (recuadro de seguridad ER CAI)

```
 prsn ──< prpf >── prfl ──< prms >── accn
   │                 │
   └─────< sesn >────┘
```

| Tabla | Qué guarda |
|---|---|
| `seguridad.prsn` | Usuarios del sistema |
| `seguridad.prfl` | Perfiles: ADM, CORD, LEGAL, TSOC, PSIC, EDUC, CONS, JUEZ |
| `seguridad.prpf` | **Perfiles asignados a cada usuario**. La crea `db/02_seguridad_rbac.sql`, porque el DDL v8 tenía `sesn.prpf_id` pero no la tabla |
| `seguridad.accn` | Acciones del sistema, con formato `recurso.operacion` (ej. `adolescente.crear`) |
| `seguridad.prms` | Qué acciones puede ejecutar cada perfil |
| `seguridad.sesn` | Inicio (`sesnfcin`) y cierre (`sesnfcfn`) de cada sesión, con su perfil |
| `seguridad.historial` | Auditoría automática por triggers (solo lectura) |

## 2. Flujo de autorización de cada petición

1. **`JwtAuthGuard`**: valida la firma y la expiración del token (8 h). Si falla, responde 401.
2. **`RolesGuard`**, la autorización dinámica:
   1. Si la ruta es `@Public()`, pasa.
   2. La sesión del token (`sesion_id`) debe seguir abierta en `sesn` y el usuario debe estar activo. Si no, responde **401**. Por eso el logout, el cierre forzado y la desactivación del usuario invalidan el token al instante.
   3. El perfil **ADM** tiene acceso total.
   4. Se calcula la acción del endpoint a partir de la ruta y el verbo HTTP:

      | Verbo | Operación | Ejemplo |
      |---|---|---|
      | GET | `consultar` | `GET /adolescente/5` → `adolescente.consultar` |
      | POST | `crear` | `POST /representante` → `representante.crear` |
      | PUT / PATCH | `actualizar` | `PATCH /taller/2` → `taller.actualizar` |
      | DELETE | `eliminar` | `DELETE /expediente/1` → `expediente.eliminar` |

      Un endpoint puede declarar su propia acción con `@RequiereAccion('reportes.exportar')`.
   5. Si la acción existe en `accn`, el perfil debe tenerla activa en `prms`. Si no la tiene, responde **403** con el nombre de la acción.
   6. Si la acción no está registrada, se usa el `@Roles(...)` del controlador como respaldo. El enum `Rol` se traduce a los códigos de la BD: Jurídico → LEGAL, Trabajador Social → TSOC, etc.

La matriz se guarda en memoria durante 60 s. Cualquier cambio hecho por la API en perfiles, acciones o permisos la recarga al momento, sin reiniciar el servidor.

## 3. Matriz inicial (`db/02_seguridad_rbac.sql`)

Son 27 recursos × 4 operaciones = **108 acciones**.

| Perfil | Permisos | Alcance |
|---|---:|---|
| ADM | 108 | Todo |
| CORD | 43 | Consulta todo, incluida la seguridad. Crea y actualiza casos, familia, talleres y documentos |
| LEGAL | 37 | Consulta lo operativo. CRUD completo de expediente, medidas, infracciones y documentos |
| JUEZ | 35 | Consulta lo operativo. CRUD de expediente, medidas, infracciones, catálogo de medidas y documentos (tarea 2.4) |
| TSOC | 30 | Consulta lo operativo. CRUD de representantes y vínculos familiares |
| EDUC | 26 | Consulta lo operativo. CRUD de talleres y asistencias |
| PSIC | 22 | Consulta lo operativo. Registra documentos del expediente |
| CONS | 20 | Solo lectura de lo operativo (fiscalización) |

"Lo operativo" excluye usuarios, perfiles, acciones, permisos, sesiones e historial.

## 4. Endpoints de seguridad

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/auth/login` | `{login, password, prfl_id?}`. El perfil debe estar asignado al usuario. Devuelve token, sesión y `perfilesDisponibles` |
| GET | `/auth/me` | Usuario, perfil y **lista de acciones permitidas** (para que el frontend muestre u oculte menús) |
| POST | `/auth/logout` | Cierra la sesión del propio token |
| POST | `/auth/change-password` | Solo la propia contraseña |
| GET/POST/PATCH/DELETE | `/users` | Usuarios. Al crear exige `tppr_id` y `perfiles_ids` (RF-12 → RF-01) |
| GET/PUT | `/users/:id/perfiles` | Perfiles asignados al usuario |
| GET/POST/PATCH/DELETE | `/perfil` | Perfiles. ADM no se puede desactivar |
| GET | `/perfil/:id/permisos` | Acciones del perfil |
| GET/POST/PATCH/DELETE | `/accion` | Catálogo de acciones (`?q=` para buscar) |
| GET/POST/DELETE | `/permiso` | Matriz. Filtros `?prfl_id=&accn_id=` |
| POST | `/permiso/perfil/:prflId/acciones` | Asignación masiva `{accn_ids:[...]}` |
| DELETE | `/permiso/perfil/:prflId/acciones/:accnId` | Revocar |
| GET | `/sesion?activas=true&prsn_id=` | Bitácora de sesiones |
| PATCH | `/sesion/:id/cerrar` | Cierre forzado (invalida el token) |
| GET | `/historial?tabla=&registro_id=&usuario_id=&accion=&desde=&hasta=&pagina=&limite=` | Auditoría |

Todas las bajas son lógicas (`estado = 'F'`).

## 5. Pruebas

- **Unitarias:** `src/common/guards/roles.guard.spec.ts`, 7 casos del guard.
- **De integración** contra PostgreSQL con el DDL v8 + `02_seguridad_rbac.sql`: 46 casos. Incluyen intento de escalar a ADM (403), revocar y otorgar permisos en caliente, token inválido tras logout, cierre forzado y desactivación (401), y duplicados (409).

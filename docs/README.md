# Documentación del Proyecto - Mi Ferrocarril (BE-app)

Bienvenido a la documentación del backend del proyecto. Aquí encontrará toda la información necesaria para entender, instalar y ejecutar la aplicación.
  
## Índice de Contenidos
## Índice de Contenidos
- [1. Proposal](#1-proposal)
- [2. Links a PR/MR y issues](#2-links-a-prmr-y-issues)
- [3. Instrucciones de instalación](#3-instrucciones-de-instalación)
- [4. Documentación de la API](#4-documentación-de-la-api)
- [5. Evidencia de ejecución de tests automáticos](#5-evidencia-de-ejecución-de-tests-automáticos)
- [6. Tracking de features y bugs](#6-tracking-de-features-y-bugs)
- [7. Deploy](#7-deploy)
- [8. Demo de app en video](#8-demo-de-app-en-video)

## 1. Proposal 
- Proposal: [proposal.md](https://github.com/santifnob/tp/blob/main/proposal.md)

## 2. Links a PR/MR y issues
- Repositorio backend: https://github.com/santifnob/BE-app
- Pull requests / merge requests: https://github.com/santifnob/BE-app/pulls

## 3. Instrucciones de instalación

## Requisitos Previos
- **Node.js**: v18.0.0 o superior
- **npm**: v8.0.0 o superior (o **pnpm**: v7.0.0 o superior)
- **MySQL**: v8.0 o superior
- **Git**: para clonar el repositorio

## Pasos de Instalación

### 1. Clonar el Repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd BE-app
```

### 2. Instalar Dependencias

Usando **pnpm** (recomendado):
```bash
pnpm install
```

O usando **npm**:
```bash
npm install
```

### 3. Configurar Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto con la siguiente estructura:

```env
# Base de Datos
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=ferrocarril_db

# Servidor
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=tu_secreto_jwt_aqui
JWT_EXPIRES_IN=24h
```

### 4. Configurar la Base de Datos

#### Opción A: Usando el dump SQL proporcionado

```bash
mysql -u root -p ferrocarril_db < docs/FERROCARRIL_DB.sql
```

#### Opción B: Usando datos de ejemplo

```bash
mysql -u root -p ferrocarril_db < docs/sample_data_dump.sql
```

### 5. Compilar TypeScript

```bash
npm run build
```

O en modo watch:

```bash
npm run start:dev
```

## Ejecución

### Modo Desarrollo

Con reinicio automático en caso de cambios:

```bash
pnpm start:dev
```

El servidor estará disponible en `http://localhost:3000`

### Modo Producción

```bash
npm start
```

## Testing

### Ejecutar todos los tests

```bash
pnpm test
```

### Ejecutar tests en modo watch

```bash
pnpm test --watch
```

### Ejecutar solo tests unitarios

```bash
pnpm test -- test/unit
```

### Ejecutar solo tests de integración

```bash
pnpm test -- test/integrate
```

## Linting

### Verificar estilo de código

```bash
pnpm lint
```

### Fijar automáticamente problemas de linting

```bash
pnpm lint:fix
```

## Estructura de Directorios

```
BE-app/
├── src/                          # Código fuente
│   ├── app.ts                   # Configuración principal
│   ├── analytics/               # Módulo de análisis
│   ├── carga/                   # Gestión de cargas
│   ├── categoriaDenuncia/       # Categorías de denuncias
│   ├── conductor/               # Gestión de conductores
│   ├── estadoTren/              # Estados de trenes
│   ├── licencia/                # Gestión de licencias
│   ├── lineaCarga/              # Líneas de carga
│   ├── middlewares/             # Middleware de autenticación
│   ├── observacion/             # Observaciones de viajes
│   ├── recorrido/               # Gestión de recorridos
│   ├── shared/                  # Código compartido
│   ├── tipoCarga/               # Tipos de carga
│   ├── tren/                    # Gestión de trenes
│   └── viaje/                   # Gestión de viajes
├── test/                         # Tests
│   ├── unit/                    # Tests unitarios
│   └── integrate/               # Tests de integración
├── docs/                         # Documentación
├── dist/                         # Código compilado (generado)
├── package.json                 # Dependencias
└── tsconfig.json               # Configuración TypeScript
```

## Solución de Problemas

### Error de conexión a base de datos

1. Verificar que MySQL esté corriendo
2. Confirmar credenciales en `.env`
3. Verificar que la base de datos existe: 
   ```bash
   mysql -u root -p -e "SHOW DATABASES;"
   ```

### Puertos ya en uso

Si el puerto 3000 está ocupado, cambiar en `.env`:
```env
PORT=3001
```

### Problemas con dependencias

Limpiar e reinstalar:
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## 4. Documentación de la API
## Base URL
```
http://localhost:3000/api
```

## Autenticacion
Todos los endpoints protegidos requieren un token JWT en el header:

```
Authorization: Bearer <token_jwt>
```

## Formato de Respuestas

### Respuesta Exitosa (2xx)

```json
{
  "data": {
    "id": 1,
    "campo": "valor"
  },
  "message": "Operación exitosa"
}
```

### Respuesta con Error (4xx, 5xx)

```json
{
  "error": "Descripción del error",
  "statusCode": 400,
  "timestamp": "2026-05-06T10:30:00Z"
}
```

## Endpoints (CRUD REST)

Todos los recursos soportan las operaciones estándar REST:
- `GET /<recurso>` - Listar (con parámetros de consulta `page` y `limit`)
- `GET /<recurso>/:id` - Obtener uno
- `POST /<recurso>` - Crear
- `PUT /<recurso>/:id` - Actualizar
- `DELETE /<recurso>/:id` - Eliminar

### Recursos
- `/tren` - Trenes
- `/conductor` - Conductores
- `/viaje` - Viajes
- `/carga` - Cargas
- `/licencia` - Licencias
- `/recorrido` - Recorrido
- `/estadoTren` - Estados de tren
- `/tipoCarga` - Tipo de cargas 
- `/categoriaDenuncia` - Categoria denuncia
- `/observacion` - Observaciones
- `/lineaCarga` - Linea carga
- `/analytics` - Analiticas

## HTTP Status Codes

| Codigo | Descripcion |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 500 | Server Error |

## 5. Evidencia de ejecución de tests automáticos
## Tests Unitarios

### Archivos de Test Disponibles

- `test/unit/licenciaConductor.test.ts` - Tests para funcionalidad de licencias
- `test/unit/validacionViaje.test.ts` - Tests para validaciones de viajes

### Ejecución de Tests Unitarios

Para ejecutar los tests unitarios:

```bash
pnpm test -- test/unit
```

### Resultados

#### Test: licenciaConductor.test.ts

**Descripción**: Valida el comportamiento del módulo de licencias de conductores.

**Casos de Prueba**:
- [ ] Validar creación de licencia válida
- [ ] Rechazar licencia sin número
- [ ] Validar fechas de vencimiento
- [ ] Verificar relación con conductor

#### Test: validacionViaje.test.ts

**Descripción**: Valida las reglas de negocio para viajes.

**Casos de Prueba**:
- [ ] Validar creación de viaje correcta
- [ ] Rechazar viaje sin conductor
- [ ] Verificar que hora llegada > hora salida
- [ ] Validar disponibilidad de tren
- [ ] Validar capacidad de carga

## Tests de Integración

### Archivos de Test Disponibles

- `test/integrate/viajeAPI.test.ts` - Tests de integración para API de viajes

### Ejecución de Tests de Integración

Para ejecutar los tests de integración:

```bash
pnpm test -- test/integrate
```

### Resultados

#### Test: viajeAPI.test.ts

**Descripción**: Prueba la integración completa de los endpoints de viajes.

**Endpoints Testeados**:
- [ ] GET /api/viaje - Listar viajes
- [ ] GET /api/viaje/:id - Obtener viaje específico
- [ ] POST /api/viaje - Crear viaje
- [ ] PUT /api/viaje/:id - Actualizar viaje
- [ ] DELETE /api/viaje/:id - Eliminar viaje

## Ejecución Completa de Tests

### Comando

```bash
pnpm test
```

### Plantilla de Resultado

```
PASS test/unit/licenciaConductor.test.ts
PASS test/unit/validacionViaje.test.ts
PASS test/integrate/viajeAPI.test.ts

Test Files  3 passed (3)
Tests       15 passed (15)
```

---

## Historial de Ejecuciones

### Formato para registrar ejecuciones

```markdown
### Ejecución #[Número] - [Fecha]

**Fecha/Hora**: YYYY-MM-DD HH:MM:SS
**Rama**: [nombre-rama]
**Resultado General**: ✅ PASSED / ❌ FAILED
**Total Tests**: X
**Pasados**: X
**Fallidos**: X
**Skipped**: X
**Duración**: Xs

#### Detalles por archivo

**test/unit/licenciaConductor.test.ts**
- Resultado: ✅ PASSED
- Tests: X/X pasados

**test/unit/validacionViaje.test.ts**
- Resultado: ✅ PASSED
- Tests: X/X pasados

**test/integrate/viajeAPI.test.ts**
- Resultado: ✅ PASSED
- Tests: X/X pasados
```

## 6. Tracking de features y bugs

## 7. Deploy

## 8. Demo de app en video
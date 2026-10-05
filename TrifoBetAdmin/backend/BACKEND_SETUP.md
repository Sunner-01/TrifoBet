# Guía de Configuración - Backend NestJS TrifoBet

## Paso 1: Crear Proyecto NestJS

```bash
# En una carpeta separada del frontend
mkdir trifobet-backend
cd trifobet-backend

# Instalar CLI de NestJS globalmente (si no lo tienes)
npm i -g @nestjs/cli

# Crear nuevo proyecto
nest new . --skip-git
```

## Paso 2: Instalar Dependencias Principales

```bash
npm install \
  @nestjs/common @nestjs/core @nestjs/platform-express \
  @nestjs/typeorm typeorm mysql2 \
  @nestjs/jwt @nestjs/passport passport passport-session \
  express-session \
  bcryptjs \
  class-validator class-transformer \
  dotenv \
  helmet cors
```

## Paso 3: Instalar Dependencias de Desarrollo

```bash
npm install --save-dev \
  @types/express @types/node \
  @nestjs/cli \
  typescript ts-node ts-loader
```

## Paso 4: Estructura de Carpetas Base

```bash
# Crear carpetas para la arquitectura limpia
mkdir -p src/config
mkdir -p src/common/{decorators,filters,guards,interceptors,middleware,pipes}
mkdir -p src/database/{entities,repositories,migrations,seeds}
mkdir -p src/modules/{auth,users,transactions,games,bets,reports}/{dto,entities}
mkdir -p src/utils/{validators,formatters,helpers}
mkdir -p test
```

## Paso 5: Archivo .env

Crear archivo `.env` en la raíz:

```env
# Server
PORT=3001
NODE_ENV=development
API_PREFIX=api

# Database (JSON local para desarrollo)
DATABASE_TYPE=json
DATABASE_PATH=./data/database.json

# Para PostgreSQL en producción:
# DATABASE_TYPE=postgres
# DATABASE_HOST=localhost
# DATABASE_PORT=5432
# DATABASE_USERNAME=postgres
# DATABASE_PASSWORD=password
# DATABASE_NAME=trifobet

# Session
SESSION_SECRET=your-super-secret-session-key-change-in-production
SESSION_EXPIRY=24h

# CORS
CORS_ORIGIN=http://localhost:3000

# Admin
ADMIN_EMAIL=admin@trifobet.com
ADMIN_PASSWORD_HASH=$2b$10$... (bcrypt hash)

# Currency
DEFAULT_CURRENCY=BOB
```

## Paso 6: Archivo package.json Scripts

Actualizar la sección `scripts` en `package.json`:

```json
{
  "scripts": {
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  }
}
```

## Paso 7: Estructura del main.ts

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix(process.env.API_PREFIX || 'api');
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`API running on http://localhost:${port}`);
}
bootstrap();
```

## Paso 8: Módulos a Crear

### 1. Auth Module
- Controller: Rutas de login/logout
- Service: Lógica de autenticación
- Estrategia de sesión

### 2. Users Module
- Controller: CRUD de usuarios
- Service: Lógica de usuarios
- Validación de datos

### 3. Transactions Module
- Controller: Historial de transacciones
- Service: Procesamiento de pagos
- Validación de montos

### 4. Games Module
- Controller: Gestión de juegos
- Service: Operaciones con juegos
- RTP management

### 5. Bets Module
- Controller: Apuestas deportivas
- Service: Cuotas y eventos
- Cálculo de ganancias

### 6. Reports Module
- Controller: Generación de reportes
- Service: Análisis de datos
- Exportación CSV/PDF

## Paso 9: Base de Datos - JSON Local (Desarrollo)

Crear archivo `data/database.json`:

```json
{
  "users": [],
  "transactions": [],
  "games": [],
  "bets": [],
  "sessions": []
}
```

Para producción, conectar a PostgreSQL usando TypeORM.

## Paso 10: Variables Globales de Tipo

Crear `src/types/index.ts`:

```typescript
export interface User {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  ciudad: string;
  estado: 'activo' | 'inactivo';
  saldo: number;
  documento: string;
  pais: string;
  fechaRegistro: Date;
  ultimoAcceso: Date;
  passwordHash: string;
}

export interface Transaction {
  id: string;
  usuarioId: string;
  tipo: 'deposito' | 'retiro' | 'apuesta' | 'premio';
  monto: number;
  moneda: 'BOB';
  metodoPago: string;
  fecha: Date;
  estado: 'completada' | 'pendiente' | 'fallida';
  concepto: string;
  referencia: string;
}

export interface Game {
  id: string;
  nombre: string;
  tipo: 'slots' | 'mesa' | 'instantaneo';
  proveedor: string;
  rtp: number;
  estado: 'activo' | 'inactivo';
  descripcion: string;
  jugadoresActivos: number;
  ingresoHoy: number;
}

export interface Bet {
  id: string;
  evento: string;
  deporte: string;
  mercado: string;
  cuota: number;
  estado: 'activo' | 'cerrado' | 'cancelado';
  fechaInicio: Date;
  fechaFin: Date;
  volumenApuestas: number;
  ingresoEstimado: number;
}
```

## Paso 11: Iniciar el Servidor

```bash
npm run start:dev
```

El servidor estará disponible en `http://localhost:3001`

## Paso 12: Testing

```bash
# Pruebas unitarias
npm run test

# Cobertura de pruebas
npm run test:cov
```

## Paso 13: Build para Producción

```bash
npm run build
npm run start:prod
```

## Estructura de Respuestas API

Todas las respuestas deben seguir este formato:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}
```

## Ejemplos de Endpoints

### Autenticación
```
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me
```

### Usuarios
```
GET /api/users
GET /api/users/:id
POST /api/users
PUT /api/users/:id
DELETE /api/users/:id
PATCH /api/users/:id/toggle-status
```

### Transacciones
```
GET /api/transactions
GET /api/transactions/:id
POST /api/transactions
GET /api/transactions/user/:userId
```

### Juegos
```
GET /api/games
GET /api/games/:id
POST /api/games
PUT /api/games/:id
DELETE /api/games/:id
PATCH /api/games/:id/toggle-status
```

### Apuestas
```
GET /api/bets
GET /api/bets/:id
POST /api/bets
PUT /api/bets/:id
DELETE /api/bets/:id
```

### Reportes
```
GET /api/reports/summary
GET /api/reports/monthly/:month
GET /api/reports/users
GET /api/reports/export
```

## Notas Importantes

1. **Moneda**: Todas las operaciones usan Boliviano (BOB)
2. **Validación**: Implementar validación en todos los DTOs
3. **Autenticación**: Sesiones tradicionales con express-session
4. **CORS**: Configurar para el frontend en localhost:3000
5. **Errores**: Usar excepciones de NestJS (BadRequestException, UnauthorizedException, etc.)
6. **Logging**: Implementar logger personalizado para debugging

## Referencias

- [Documentación NestJS](https://docs.nestjs.com)
- [TypeORM Docs](https://typeorm.io/)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)

# TrifoBet Backend - NestJS

## Estructura del Proyecto Backend

Este es el backend de TrifoBet, un sistema administrativo para un casino en línea.

### Arquitectura

```
backend/
├── src/
│   ├── main.ts                           # Punto de entrada de la aplicación
│   ├── app.module.ts                     # Módulo raíz
│   ├── app.controller.ts                 # Controlador de salud
│   ├── app.service.ts                    # Servicio de salud
│   │
│   ├── config/                           # Configuración de la aplicación
│   │   ├── database.config.ts
│   │   ├── env.config.ts
│   │   └── jwt.config.ts
│   │
│   ├── common/                           # Utilidades comunes
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── middleware/
│   │   └── pipes/
│   │
│   ├── database/                         # Configuración de base de datos
│   │   ├── entities/
│   │   ├── repositories/
│   │   ├── migrations/
│   │   └── seeds/
│   │
│   ├── modules/
│   │   ├── auth/                         # Módulo de autenticación
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── dto/
│   │   │   └── strategies/
│   │   │
│   │   ├── users/                        # Módulo de usuarios
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.module.ts
│   │   │   ├── dto/
│   │   │   └── entities/
│   │   │
│   │   ├── transactions/                 # Módulo de transacciones
│   │   │   ├── transactions.controller.ts
│   │   │   ├── transactions.service.ts
│   │   │   ├── transactions.module.ts
│   │   │   ├── dto/
│   │   │   └── entities/
│   │   │
│   │   ├── games/                        # Módulo de juegos
│   │   │   ├── games.controller.ts
│   │   │   ├── games.service.ts
│   │   │   ├── games.module.ts
│   │   │   ├── dto/
│   │   │   └── entities/
│   │   │
│   │   ├── bets/                         # Módulo de apuestas deportivas
│   │   │   ├── bets.controller.ts
│   │   │   ├── bets.service.ts
│   │   │   ├── bets.module.ts
│   │   │   ├── dto/
│   │   │   └── entities/
│   │   │
│   │   └── reports/                      # Módulo de reportes
│   │       ├── reports.controller.ts
│   │       ├── reports.service.ts
│   │       ├── reports.module.ts
│   │       └── dto/
│   │
│   └── utils/                            # Utilidades generales
│       ├── validators/
│       ├── formatters/
│       └── helpers/
│
├── test/                                 # Pruebas
├── .env.example                          # Ejemplo de variables de entorno
├── docker-compose.yml                    # Docker compose para base de datos
├── package.json
└── tsconfig.json
```

### Principios SOLID Implementados

1. **Single Responsibility Principle**: Cada servicio tiene una única responsabilidad
2. **Open/Closed Principle**: Abierto para extensión, cerrado para modificación
3. **Liskov Substitution Principle**: Interfaces para abstraer implementaciones
4. **Interface Segregation Principle**: DTOs específicos para cada caso de uso
5. **Dependency Inversion**: Inyección de dependencias via NestJS

### Estructura de Datos

#### Moneda
- Sistema utiliza Boliviano (BOB)
- Todos los valores monetarios se almacenan con 2 decimales
- Formateo: `Bs {cantidad.toFixed(2)}`

#### Autenticación
- Sesiones tradicionales (no JWT)
- Almacenamiento en sesión del servidor
- Protección CSRF

#### Modelos de Datos

##### Usuario
```typescript
{
  id: string
  nombre: string
  email: string
  telefono: string
  ciudad: string
  estado: 'activo' | 'inactivo'
  saldo: number
  documento: string
  pais: string
  fechaRegistro: Date
  ultimoAcceso: Date
}
```

##### Transacción
```typescript
{
  id: string
  usuarioId: string
  tipo: 'deposito' | 'retiro' | 'apuesta' | 'premio'
  monto: number
  moneda: 'BOB'
  metodoPago: string
  fecha: Date
  estado: 'completada' | 'pendiente' | 'fallida'
  concepto: string
}
```

##### Juego
```typescript
{
  id: string
  nombre: string
  tipo: 'slots' | 'mesa' | 'instantaneo'
  proveedor: string
  rtp: number
  estado: 'activo' | 'inactivo'
  descripcion: string
}
```

##### Apuesta Deportiva
```typescript
{
  id: string
  evento: string
  deporte: string
  mercado: string
  cuota: number
  estado: 'activo' | 'cerrado' | 'cancelado'
  fechaInicio: Date
  fechaFin: Date
}
```

### Instalación

```bash
# Crear proyecto NestJS
nest new trifobet-backend

# Instalar dependencias adicionales
npm install typeorm mysql2 @nestjs/jwt @nestjs/passport passport passport-session express-session bcryptjs class-validator class-transformer

# Ejecutar migraciones
npm run migration:run

# Iniciar servidor
npm run start:dev
```

### Variables de Entorno

Crear archivo `.env`:

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=trifobet

# Session
SESSION_SECRET=your-secret-key-here

# JWT (opcional para autenticación futura)
JWT_SECRET=your-jwt-secret
JWT_EXPIRATION=24h

# API
API_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
```

### Endpoints Base

- `GET /api/health` - Health check
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Testing

```bash
npm run test
npm run test:cov
```

### Documentación

La API está documentada con Swagger en `/api/docs`

## Configuración de Base de Datos

El proyecto soporta:
- **Desarrollo**: JSON local (mock)
- **Producción**: PostgreSQL + TypeORM

## Seguridad

- CORS configurado
- Validación de entrada en todos los endpoints
- Rate limiting
- Password hashing con bcryptjs
- Session management seguro

## Notas Importantes

- Moneda única: BOB (Boliviano)
- Todas las fechas en UTC
- Formato de respuesta consistente
- Manejo de errores centralizado

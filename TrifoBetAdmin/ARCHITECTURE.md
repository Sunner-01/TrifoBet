# Arquitectura TrifoBet - Sistema Administrativo de Casino

## Visión General

TrifoBet es un sistema administrativo completo para un casino en línea, separado en dos aplicaciones independientes:

1. **Frontend**: Next.js 16+ con React 19
2. **Backend**: NestJS con TypeORM/JSON

## Flujo de Comunicación

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTP/REST
       ▼
┌──────────────────┐       ┌──────────────────┐
│  Next.js 16      │──────▶│   NestJS API     │
│  (Frontend)      │       │   (Backend)      │
│                  │◀──────│                  │
│ - UI             │       │ - Lógica negocio │
│ - Validación     │       │ - BD             │
│ - Routing        │       │ - Seguridad      │
└──────────────────┘       └──────────────────┘
       │                            │
       │                            ▼
       │                   ┌────────────────┐
       │                   │  PostgreSQL    │
       │                   │  (Producción)  │
       │                   └────────────────┘
       │
       ▼
  Sesión Browser
  (SessionStorage)
```

## Principios Arquitectónicos

### 1. Arquitectura Limpia

```
Entities
  │
  ├── Use Cases (Services)
  │     │
  │     └── Interface Adapters (Controllers)
  │            │
  │            └── Frameworks (Express, Next.js)
```

### 2. Separación de Responsabilidades

#### Frontend (Next.js)
- **Páginas**: Componentes de página con enrutamiento
- **Componentes**: Componentes reutilizables
- **Hooks**: Lógica de estado (useAuth, custom hooks)
- **Servicios**: Funciones para llamadas a API
- **Estilos**: Tailwind CSS con tokens de diseño

#### Backend (NestJS)
- **Controllers**: Manejo de rutas HTTP
- **Services**: Lógica de negocio
- **Repositories**: Acceso a datos
- **Entities**: Modelos de datos
- **DTOs**: Transferencia de datos
- **Middleware**: Autenticación, CORS, logging
- **Guards**: Control de acceso
- **Pipes**: Validación de entrada
- **Filters**: Manejo de excepciones

### 3. Patrón de Inyección de Dependencias

```typescript
// Auth Service depende de Users Repository
@Injectable()
export class AuthService {
  constructor(private usersRepository: UsersRepository) {}
  
  async login(email: string, password: string) {
    // Usa repository inyectado
  }
}

// Auth Module registra las dependencias
@Module({
  providers: [AuthService, UsersRepository],
  exports: [AuthService],
})
export class AuthModule {}
```

## Módulos del Sistema

### 1. Módulo de Autenticación

**Responsabilidad**: Gestionar sesiones de administradores

```
┌─────────────────────────────────┐
│     AuthController              │
│  POST /auth/login               │
│  POST /auth/logout              │
│  GET  /auth/me                  │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│     AuthService                 │
│  - validateCredentials()        │
│  - createSession()              │
│  - destroySession()             │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   SessionManager (Middleware)   │
│  - express-session              │
│  - passport-session             │
└─────────────────────────────────┘
```

**Flujo de Login**:
1. Usuario ingresa email/contraseña
2. AuthController valida payload
3. AuthService busca usuario en BD
4. Compara contraseña (bcryptjs)
5. Crea sesión con passport
6. Retorna datos de usuario

### 2. Módulo de Usuarios

**Responsabilidad**: CRUD de usuarios, gestión de saldos

```
┌──────────────────────────────┐
│   UsersController            │
│  GET  /users                 │
│  GET  /users/:id             │
│  POST /users                 │
│  PUT  /users/:id             │
│  DELETE /users/:id           │
│  PATCH /users/:id/status     │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│   UsersService               │
│  - getAll()                  │
│  - getById()                 │
│  - create()                  │
│  - update()                  │
│  - delete()                  │
│  - toggleStatus()            │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│   UsersRepository            │
│  - Acceso a datos            │
│  - Caché                     │
└──────────────────────────────┘
```

### 3. Módulo de Transacciones

**Responsabilidad**: Procesar y registrar movimientos financieros

```
┌──────────────────────────────┐
│  TransactionsController      │
│  GET  /transactions          │
│  GET  /transactions/:id      │
│  POST /transactions          │
│  GET  /transactions/user/:id │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  TransactionsService         │
│  - processDeposit()          │
│  - processWithdrawal()       │
│  - recordBet()               │
│  - recordPrize()             │
│  - getHistory()              │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  TransactionsRepository      │
│  - Persistencia de datos     │
│  - Reportes                  │
└──────────────────────────────┘
```

### 4. Módulo de Juegos

**Responsabilidad**: Administrar juegos propios (slots, mesas, etc.)

```
┌──────────────────────────────┐
│    GamesController           │
│  GET  /games                 │
│  POST /games                 │
│  PUT  /games/:id             │
│  DELETE /games/:id           │
│  PATCH /games/:id/status     │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│    GamesService              │
│  - addGame()                 │
│  - updateGame()              │
│  - removeGame()              │
│  - toggleStatus()            │
│  - getStats()                │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│    GamesRepository           │
│  - Gestión de juegos         │
│  - RTP tracking              │
└──────────────────────────────┘
```

### 5. Módulo de Apuestas Deportivas

**Responsabilidad**: Gestionar eventos y mercados de apuestas

```
┌──────────────────────────────┐
│    BetsController            │
│  GET  /bets                  │
│  POST /bets                  │
│  PUT  /bets/:id              │
│  DELETE /bets/:id            │
│  PATCH /bets/:id/status      │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│    BetsService               │
│  - createEvent()             │
│  - updateQuotes()            │
│  - closeEvent()              │
│  - cancelEvent()             │
│  - calculateOdds()           │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│    BetsRepository            │
│  - Eventos deportivos        │
│  - Cuotas                    │
└──────────────────────────────┘
```

### 6. Módulo de Reportes

**Responsabilidad**: Análisis y estadísticas del sistema

```
┌──────────────────────────────┐
│   ReportsController          │
│  GET /reports/summary        │
│  GET /reports/monthly/:month │
│  GET /reports/users          │
│  GET /reports/export         │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│   ReportsService             │
│  - calculateMetrics()        │
│  - generatePDF()             │
│  - exportCSV()               │
│  - getUserStats()            │
│  - getGameStats()            │
└──────────────────────────────┘
```

## Flujos de Casos de Uso

### UC-1: Login de Administrador

```
Admin                Frontend            Backend
  │                    │                   │
  ├─Ingresa creds─────▶│                   │
  │                    ├─POST /auth/login─▶│
  │                    │                   ├─Valida email/pass
  │                    │                   ├─Busca usuario
  │                    │                   ├─Verifica contraseña
  │                    │                   ├─Crea sesión
  │                    │◀─200 + SessionID─┤
  │                    ├─Almacena sesión   │
  │◀─Redirige dashboard│                   │
```

### UC-2: Crear Usuario

```
Admin          Frontend           Backend        BD
  │              │                 │              │
  ├─Click Nuevo─▶│                 │              │
  │              ├─Abre Modal      │              │
  │              │                 │              │
  ├─Completa───▶│                 │              │
  │              ├─POST /users───▶│              │
  │              │                 ├─Valida DTO  │
  │              │                 ├─Hash pwd    │
  │              │                 ├─Create user─┤
  │              │                 │              ├─INSERT
  │              │                 │◀─User data─┤
  │              │◀─200 + User───┤              │
  │◀─Éxito────━━┤                 │              │
  │              └─Cierra Modal    │              │
```

### UC-3: Procesar Transacción

```
User           Frontend           Backend        BD
  │              │                 │              │
  ├─Deposita───▶│                 │              │
  │              ├─POST /trans───▶│              │
  │              │                 ├─Valida monto│
  │              │                 ├─Verifica BD │
  │              │                 ├─Actualiza   │
  │              │                 │  saldo─────▶│
  │              │                 ├─Registra tx─┤
  │              │◀─200 + Conf────┤              │
  │◀─Confirmado─┤                 │              │
```

## Validación y Seguridad

### Validación en 3 capas

```typescript
// 1. Frontend (próxima validación)
form.validate(data) ✗ Muestra error

// 2. DTO + Pipes (NestJS)
@Controller()
@UseGuards(AuthGuard('session'))
@UsePipes(new ValidationPipe())
create(@Body() createUserDto: CreateUserDto) {
  // DTO automáticamente validado
}

// 3. Service (Lógica de negocio)
async create(createUserDto: CreateUserDto) {
  if (await this.findByEmail(createUserDto.email)) {
    throw new ConflictException('Email ya existe');
  }
}
```

### Autenticación y Autorización

```
Request
   │
   ▼
┌─────────────────────────────┐
│  SessionMiddleware          │
│  Verifica session ID válida │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  AuthGuard                  │
│  Verifica usuario en sesión │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  RoleGuard                  │
│  Verifica permisos          │
└──────────┬──────────────────┘
           │
           ▼
        Controller
```

## Estructura de Datos - Moneda Boliviana

```typescript
interface CurrencyValue {
  monto: number;           // 1500.50
  moneda: 'BOB';          // Boliviano
  formateado: string;     // "Bs 1,500.50"
  
  // Métodos helper
  toString(): string;     // "Bs 1500.50"
  toFixed(2): string;     // "1500.50"
  toCents(): number;      // 150050
}
```

## Performance y Escalabilidad

### Caching
```typescript
// Redis (producción)
@Get('/users')
@Cacheable({ ttl: 300 })
getAll() {
  return this.usersService.getAll();
}

// JSON (desarrollo)
cache.get(key) -> Retorna caché o null
```

### Paginación
```typescript
// Todos los GET retornan paginados
GET /users?page=1&limit=20&sort=-createdAt

Response:
{
  data: [...],
  total: 250,
  page: 1,
  limit: 20,
  totalPages: 13
}
```

### Rate Limiting
```typescript
@UseGuards(ThrottleGuard)
@Throttle(100, 60) // 100 requests per 60 seconds
@Post('/auth/login')
login(@Body() credentials: LoginDto) {
  // Login limitado a 100 intentos por minuto
}
```

## Monitoreo y Logs

```
┌──────────────────────────────┐
│   Aplicación NestJS          │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  Logger Service              │
│  - Info                      │
│  - Warnings                  │
│  - Errors                    │
│  - Debug                     │
└────────┬─────────────────────┘
         │
         ├──▶ Console (dev)
         ├──▶ File (logs/)
         └──▶ Cloud (prod)
```

## Deployment

### Desarrollo
```bash
npm run start:dev
# Server en localhost:3001
# Frontend en localhost:3000
```

### Producción
```bash
npm run build
npm run start:prod
# Docker container
# PM2 process manager
# Reverse proxy (Nginx)
# SSL/TLS
# Database PostgreSQL
```

## Conclusión

Esta arquitectura permite:
- ✅ Escalabilidad horizontal
- ✅ Mantenimiento simplificado
- ✅ Testing desacoplado
- ✅ Reutilización de código
- ✅ Principios SOLID
- ✅ Seguridad robusta
- ✅ Performance optimizado

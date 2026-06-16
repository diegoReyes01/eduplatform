# EduPlatform 🎓

Plataforma educativa moderna con gamificación, laboratorio 3D y sistema de misiones.

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 |
| Lenguaje | TypeScript |
| Base de datos | PostgreSQL 16 |
| ORM | Prisma 5 |
| Auth | JWT + bcrypt |
| UI | Tailwind CSS + shadcn/ui |
| Animaciones | Framer Motion |
| Gráficos | Recharts |
| 3D | Three.js + React Three Fiber |
| Contenedores | Docker |

## Requisitos

- Node.js 22+
- Docker Desktop
- Git

## Instalación rápida

### 1. Clonar el proyecto
```bash
git clone https://github.com/tuusuario/eduplatform.git
cd eduplatform
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
```

Edita `.env` con tus valores:
```env
DATABASE_URL="postgresql://eduplatform_user:eduplatform_pass@localhost:5432/eduplatform_db?schema=public"
JWT_SECRET="tu_secreto_seguro_minimo_64_caracteres"
JWT_REFRESH_SECRET="otro_secreto_diferente_minimo_64_caracteres"
```

### 3. Levantar base de datos
```bash
docker compose up -d postgres
```

### 4. Instalar dependencias
```bash
npm install --legacy-peer-deps
```

### 5. Ejecutar migraciones
```bash
npx prisma migrate dev --name init
```

### 6. Cargar datos iniciales
```bash
npx tsx prisma/seed.ts
```

### 7. Iniciar servidor
```bash
npm run dev
```

Abre http://localhost:3000

## Credenciales por defecto

| Usuario | Email | Contraseña | Rol |
|---------|-------|-----------|-----|
| Super Admin | admin@eduplatform.com | Admin@123! | SUPER_ADMIN |

## Páginas disponibles

| Ruta | Descripción |
|------|-------------|
| `/` | Página de inicio |
| `/login` | Iniciar sesión |
| `/dashboard` | Panel principal |
| `/materias` | Materias estilo Netflix |
| `/notas` | Notas y calculadoras |
| `/laboratorio` | Laboratorio 3D |
| `/misiones` | Sistema de misiones y XP |
| `/logros` | Achievements y badges |
| `/ranking` | Tabla de posiciones |
| `/profesor` | Panel del profesor |
| `/admin` | Panel de administrador |

## Despliegue con Docker

### Desarrollo
```bash
docker compose up -d
```

### Producción
```bash
docker compose -f docker-compose.prod.yml up -d
```

## Scripts disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run db:migrate   # Ejecutar migraciones
npm run db:seed      # Cargar datos iniciales
npm run db:studio    # Abrir Prisma Studio
```

## Estructura del proyecto
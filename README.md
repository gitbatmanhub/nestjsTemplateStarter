# NestJS Complete Starter

Plantilla completa para arrancar proyectos con NestJS usando una base ya integrada con:

- Autenticacion JWT con access token y refresh token
- Endpoints REST documentados con Swagger
- API GraphQL code-first
- Subida de archivos con `multipart/form-data`
- WebSockets autenticados con Socket.IO
- PostgreSQL + TypeORM
- Validacion global y configuracion por variables de entorno

## Modulos incluidos

- `auth`: registro, login, refresh, logout, endpoint `me`, guards y roles
- `articles`: CRUD de ejemplo reutilizable para mostrar rutas publicas, protegidas y filtradas
- `uploads`: carga de un archivo o multiples archivos
- `realtime`: gateway de Socket.IO autenticado con JWT
- `health`: healthcheck simple para monitoreo

## Puesta en marcha

1. Instala dependencias:

```bash
npm install
```

2. Crea tu archivo `.env` a partir de `.env.template`

3. Levanta PostgreSQL:

```bash
docker compose up -d
```

4. Inicia la app:

```bash
npm run start:dev
```

## Variables de entorno

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nestjs_starter
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_SYNC=true
DB_SSL=false
JWT_SECRET=replace_with_a_long_secret
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d
API_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

## URLs principales

- Swagger: `http://localhost:3000/api/docs`
- GraphQL: `http://localhost:3000/graphql`
- Health: `http://localhost:3000/api/health`

## REST principal

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/articles`
- `POST /api/articles`
- `PATCH /api/articles/:id`
- `DELETE /api/articles/:id`
- `POST /api/uploads/single`
- `POST /api/uploads/multiple`

## GraphQL principal

Ejemplos:

```graphql
mutation Register {
  register(
    input: {
      email: "admin@example.com"
      password: "secret123"
      fullName: "Starter Admin"
      roles: [ADMIN]
    }
  ) {
    accessToken
    refreshToken
    user {
      id
      email
      roles
    }
  }
}
```

```graphql
mutation CreateArticle {
  createArticle(
    input: {
      title: "Primer articulo"
      summary: "Resumen corto para mostrar el flujo"
      content: "Contenido largo del articulo para la plantilla de ejemplo."
      tags: ["nestjs", "starter"]
      published: true
    }
  ) {
    id
    title
    slug
  }
}
```

## Socket.IO

Conecta al namespace `/realtime` enviando el access token en `auth.token` o en el header `Authorization`.

Eventos disponibles:

- `realtime:ping`
- `realtime:broadcast`
- `realtime:clients`
- `realtime:message`

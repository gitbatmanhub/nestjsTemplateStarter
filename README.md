<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456

[circleci-url]: https://circleci.com/gh/nestjs/nest

# nestjs-starter-kit


Una plantilla lista para producción con autenticación JWT, configuración modular, Docker, y más.


1. Clonar proyecto
2. ```npm install```
3. Clonar el archivo ```.env.template``` y renombrarlo a ```.env```
4. Cambiar las variables de entorno
5. Levantar la base de datos
   ```docker-compose up -d```

⚠ En caso que muestre mensaje "La bbdd xxx no existe se debe crear manualmente"

6. Ejecutar SEED

```/api/seed```

7. Levantar

   ```npm run:dev```

### Documentación

Visitar ```localhost:3000/api```

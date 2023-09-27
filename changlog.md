# Changelog

## 1.1.0 - 2023-09-27

### Sprint learnings

- En este sprint, aprendí:
  - A implementar autenticación de usuarios utilizando JSON Web Tokens (JWT).
  - A encriptar contraseñas utilizando la biblioteca `bcrypt`.
  - A realizar consultas paginadas para obtener listados de usuarios de manera eficiente.
  - A configurar y utilizar encabezados de paginación en las respuestas de la API.
  - A manejar autenticación y autorización, permitiendo el acceso solo a usuarios con el rol de administrador.

### Added

- Se añadió la función llamada `createUser` (POST - '/users') (Melanie Rodas) - 27 de septiembre de 2023.
- Se añadió la función llamada `getUserById` para obtener información de usuario por ID o correo electrónico (GET - '/users/:uid') (Melanie Rodas) - 25 de septiembre de 2023.
- Se añadieron encabezados de enlace de paginación para la primera, previa y última página (GET - '/users') (Melanie Rodas) - 25 de septiembre de 2023.
- Se implementó la función `getUsers` para obtener una lista de usuarios (GET - '/users') (Melanie Rodas) - 25 de septiembre de 2023.
- Se añadió la autenticación y autorización con JWT (Tokens Web JSON) en el middleware (`middleware/auth.js`) (Melanie Rodas) - 25 de septiembre de 2023.

### Changed

- Se cambió la función `initAdminUser` (creación de usuario administrador) para usar mongoose. Además, se añadió el modelo y esquema de usuario (Melanie Rodas).
- Se modificó el controlador `auth.js` para incluir la autenticación de usuarios utilizando JSON Web Tokens (JWT) y la encriptación de contraseñas con `bcrypt`.

### Fixed

- Se corrigió un error en el controlador `user.js` donde se obtenían los usuarios sin autenticación. Ahora, se requiere autenticación para acceder a la lista de usuarios.

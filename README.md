# Burger Queen - API con Node.js

## Índice

- [1. Preámbulo](#1-pre%C3%A1mbulo)
- [2. Resumen del proyecto](#2-resumen-del-proyecto)
- [3. API endpoints](#3-api-endpoints)
- [4. Pruebas End-To-End](#4-pruebas-end-to-end)
- [5. Criterios de aceptación mínimos del proyecto](#5-criterios-de-aceptaci%C3%B3n-m%C3%ADnimos-del-proyecto)
- [6. Objetivos de aprendizaje](#6-objetivos-de-aprendizaje)
- [6. Hacker (Devops) Edition con Docker](#6-hacker-%28devops%29-edition-con-docker)
- [7. Pistas, tips y lecturas complementarias](#7-pistas-tips-y-lecturas-complementarias)

## 1. Preámbulo

![Node.js logo](https://nodejs.org/static/images/logos/nodejs-new-pantone-black.svg)

Un pequeño restaurante de hamburguesas, que está creciendo, necesita un
sistema a través del cual puedan tomar pedidos usando una _tablet_, y enviarlos
a la cocina para que se preparen ordenada y eficientemente.

Este proyecto tiene dos áreas: interfaz web (cliente) y API (servidor). Nuestra
clienta nos ha solicitado desarrollar la API que se puede integrar con la
interfaz, que otro equipo de desarrolladoras está trabajando simultáneamente.

## 2. Resumen del proyecto

Con una API en este caso nos referimos a un _servidor web_, que es
básicamente un programa que _escucha_ en un puerto de red, a través del cual
podemos enviarle _consultas_ (_request_) y obtener _respuestas_ (_response_)
usando el protocolo HTTP (o HTTPS).

Un servidor web debe _manejar_ consultas entrantes y producir respuestas a esas
consultas que serán enviadas de vuelta al _cliente_. Cuando hablamos de
_aplicaciones de servidor_, esto implica una arquitectura de _cliente/servidor_,
donde el cliente es un programa que hace consultas a través de una red (por
ejemplo el navegador, cURL, etc.), y el _servidor_ es el programa que recibe
estas consultas y las responde.

[Node.js](https://nodejs.org/) nos permite crear servidores web súper eficientes
de manera relativamente simple y todo esto usando JavaScript!
En este proyecto partimos de un _boilerplate_ que ya contiene una serie de
_endpoints_ (puntos de conexión o URLs) y nos piden completar la aplicación.
Esto implica que tendremos que partir por leer la implementación existente, y
familiarizarnos con el _stack_ elegido ([Node.js](https://nodejs.org/) y
[Express](https://expressjs.com/)) y complementarlo con un motor de bases de
datos. Recomendamos el uso de [MongoDB](https://www.mongodb.com/) y tenemos una
[guía para empezar con MongoDB](./guides/GETTING-STARTED-MONGODB.md).

La clienta nos ha dado un [link a la documentación](https://app.swaggerhub.com/apis-docs/ssinuco/BurgerQueenAPI/2.0.0)
que especifica el comportamiento esperado de la API que expondremos por
HTTP. Ahí puedes encontrar todos los detalles de qué _endpoints_ debe
implementar la aplicación, qué parámetros esperan, qué deben responder, etc.

## 3. API endpoints

### 3.1 API

#### 3.1.1 `/`

- `GET /`

#### 3.1.2 `/auth`

- `POST /auth`

#### 3.1.3 `/users`

- `GET /users`
- `GET /users/:uid`
- `POST /users`
- `PATCH /users/:uid`
- `DELETE /users/:uid`

#### 3.1.4 `/products`

- `GET /products`
- `GET /products/:productid`
- `POST /products`
- `PATCH /products/:productid`
- `DELETE /products/:productid`

#### 3.1.5 `/orders`

- `GET /orders`
- `GET /orders/:orderId`
- `POST /orders`
- `PATCH /orders/:orderId`
- `DELETE /orders/:orderId`

## 4. Pruebas End-To-End

**Pruebas _end-to-end_**, que usaremos para verificar el comportamiento desde el
punto de vista de HTTP, desde afuera del servidor. Estos tests, a diferencia de
las pruebas unitarias, no prueban cada pieza por separado sino que prueban la
aplicación completa, de principio a fin. Estas pruebas, al no hacer uso directo
del código fuente de la aplicación, pueden ejecutarse directamente sobre una URL
remota, ya que la interfaz sometida a pruebas es HTTP.

Para ejecutar todos los tests _end-to-end_ con el comando `npm run test:e2e`.

```sh
# Corre pruebas e2e sobre instancia local. Esto levanta la aplicación con npm
# start y corre los tests contra la URL de esta instancia (por defecto
# http://127.0.0.1:8080).
npm run test:e2e

# Corre pruebas e2e sobre URL remota
REMOTE_URL=<TODO: poner URL> npm run test:e2e
```

### 5. Variables de entorno

Nuestra aplicación usa las siguientes variables de entorno:

- `PORT`: Si no se ha especificado un puerto como argumento de línea de comando,
  podemos usar la variable de entorno `PORT` para especificar el puerto. Valor
  por defecto `8080`.
- `DB_URL`: El _string_ de conexión de _MongoDB_. Cuando ejecutemos la
  aplicación en nuestra computadora (en entorno de desarrollo), podemos usar el
  una base de datos local.
- `JWT_SECRET`: Nuestra aplicación implementa autenticación usando JWT (JSON
  Web Tokens). Para poder firmar (cifrar) y verificar (descifrar) los tokens,
  nuestra aplicación necesita un secreto. En local puedes usar el valor por
  defecto (`xxxxxxxx`), pero es muy importante que uses un _secreto_ de verdad
  en producción.
- `ADMIN_EMAIL`: Opcionalmente podemos especificar un email y password para
  el usuario admin (root). Si estos detalles están presentes la aplicación se
  asegurará que exista el usuario y que tenga permisos de administrador. Valor
  por defecto `admin@localhost.com`.
- `ADMIN_PASSWORD`: Si hemos especificado un `ADMIN_EMAIL`, debemos pasar
  también una contraseña para el usuario admin. Valor por defecto: `changeme`.

## 6. Objetivos de aprendizaje

### Node.js

- [ ] **Instalar y usar módulos con npm**

    <details><summary>Links</summary><p>

  - [Sitio oficial de npm (en inglés)](https://www.npmjs.com/)
  </p></details>

- [ ] **Configuración de package.json**

    <details><summary>Links</summary><p>

  - [package.json - Documentación oficial (en inglés)](https://docs.npmjs.com/files/package.json)
  </p></details>

- [ ] **Configuración de npm-scripts**

    <details><summary>Links</summary><p>

  - [scripts - Documentación oficial (en inglés)](https://docs.npmjs.com/misc/scripts)
  </p></details>

### JavaScript

- [ ] **Pruebas unitarias (unit tests)**

    <details><summary>Links</summary><p>

  - [Empezando con Jest - Documentación oficial](https://jestjs.io/docs/es-ES/getting-started)
  </p></details>

- [ ] **Pruebas asíncronas**

    <details><summary>Links</summary><p>

  - [Tests de código asincrónico con Jest - Documentación oficial](https://jestjs.io/docs/es-ES/asynchronous)
  </p></details>

- [ ] **Uso de mocks y espías**

    <details><summary>Links</summary><p>

  - [Manual Mocks con Jest - Documentación oficial](https://jestjs.io/docs/es-ES/manual-mocks)
  </p></details>

- [ ] **Pruebas de integración (end-to-end)**

- [ ] **Módulos de ECMAScript (ES Modules)**

    <details><summary>Links</summary><p>

  - [import - MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Statements/import)
  - [export - MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Statements/export)
  </p></details>

- [ ] **Módulos de CommonJS**

    <details><summary>Links</summary><p>

  - [Modules: CommonJS modules - Node.js Docs](https://nodejs.org/docs/latest/api/modules.html)
  </p></details>

- [ ] **Uso de linter (ESLINT)**

- [ ] **Uso de identificadores descriptivos (Nomenclatura y Semántica)**

### Control de Versiones (Git y GitHub)

- [ ] **Git: Instalación y configuración**

- [ ] **Git: Control de versiones con git (init, clone, add, commit, status, push, pull, remote)**

- [ ] **Git: Integración de cambios entre ramas (branch, checkout, fetch, merge, reset, rebase, tag)**

- [ ] **GitHub: Creación de cuenta y repos, configuración de llaves SSH**

- [ ] **GitHub: Despliegue con GitHub Pages**

    <details><summary>Links</summary><p>

  - [Sitio oficial de GitHub Pages](https://pages.github.com/)
  </p></details>

- [ ] **GitHub: Colaboración en Github (branches | forks | pull requests | code review | tags)**

- [ ] **GitHub: Organización en Github (projects | issues | labels | milestones | releases)**

### Express.js

- [ ] **Manejo de rutas**

    <details><summary>Links</summary><p>

  - [Routing](https://expressjs.com/en/guide/routing.html)
    </p></details>

- [ ] **Uso y creación de middleware**

    <details><summary>Links</summary><p>

  - [Using middleware](https://expressjs.com/en/guide/using-middleware.html#using-middleware)
    </p></details>

### HTTP

- [ ] **Consulta o petición (request) y respuesta (response).**

    <details><summary>Links</summary><p>

  - [Generalidades del protocolo HTTP - MDN](https://developer.mozilla.org/es/docs/Web/HTTP/Overview)
  - [Mensajes HTTP - MDN](https://developer.mozilla.org/es/docs/Web/HTTP/Messages)
  </p></details>

- [ ] **Cabeceras (headers)**

    <details><summary>Links</summary><p>

  - [HTTP headers - MDN](https://developer.mozilla.org/es/docs/Web/HTTP/Headers)
  </p></details>

- [ ] **Cuerpo (body)**

    <details><summary>Links</summary><p>

  - [Cuerpo de Mensajes HTTP - MDN](https://developer.mozilla.org/es/docs/Web/HTTP/Messages#cuerpo)
  </p></details>

- [ ] **Verbos HTTP**

    <details><summary>Links</summary><p>

  - [Métodos de petición HTTP - MDN](https://developer.mozilla.org/es/docs/Web/HTTP/Methods)
  </p></details>

- [ ] **Códigos de status de HTTP**

    <details><summary>Links</summary><p>

  - [Códigos de estado de respuesta HTTP - MDN](https://developer.mozilla.org/es/docs/Web/HTTP/Status)
  - [The Complete Guide to Status Codes for Meaningful ReST APIs - dev.to](https://dev.to/khaosdoctor/the-complete-guide-to-status-codes-for-meaningful-rest-apis-1-5c5)
  </p></details>

- [ ] **Encodings y JSON**

    <details><summary>Links</summary><p>

  - [Introducción a JSON - Documentación oficial](https://www.json.org/json-es.html)
  </p></details>

- [ ] **CORS (Cross-Origin Resource Sharing)**

    <details><summary>Links</summary><p>

  - [Control de acceso HTTP (CORS) - MDN](https://developer.mozilla.org/es/docs/Web/HTTP/CORS)
  </p></details>

### Autenticación

- [ ] **JWT (JSON Web Token)**

- [ ] **Almacenamiento y acceso de contraseñas**

### WebOps

- [ ] **Variables de entorno**

- [ ] **Contenedores (Docker)**

- [ ] **Docker compose**

- [ ] **Cloud Functions**

### MongoDB

- [ ] **MongoDB**

  <details><summary>Links</summary><p>

  - [MongoDB](https://www.mongodb.com/)
  - [MongoDB Node Driver](https://www.mongodb.com/docs/drivers/node/current/)
  - [\*\*guía de \_primeros pasos\*\*\*](./guides/GETTING-STARTED-MONGODB.md)
  - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
    </p></details>

- [ ] **Operaciones CRUD (Create-Read-Update-Delete)**

    <details><summary>Links</summary><p>

      - [MongoDB CRUD Operations - Docs (en inglés)](https://docs.mongodb.com/manual/crud/)
      - [Insert Documents - Docs (en inglés)](https://docs.mongodb.com/manual/tutorial/insert-documents/)
      - [Query Documents - Docs (en inglés)](https://docs.mongodb.com/manual/tutorial/query-documents/)
      - [Update Documents - Docs (en inglés)](https://docs.mongodb.com/manual/tutorial/update-documents/)
      - [Delete Documents - Docs (en inglés)](https://docs.mongodb.com/manual/tutorial/remove-documents/)

  </p></details>

- [ ] **Modelos y esquemas de datos**
    <details><summary>Links</summary><p>

  - [Schema Validation - Docs (en inglés)](https://docs.mongodb.com/manual/core/schema-validation/)
  - [Data Model Design - Docs (en inglés)](https://docs.mongodb.com/manual/core/data-model-design/)
  - [Schema Validation and Data Model - mongoose](https://www.mongodb.com/developer/languages/javascript/getting-started-with-mongodb-and-mongoose/)
  - [Mongoose Schemas Creating a model](https://www.geeksforgeeks.org/mongoose-schemas-creating-a-model/)
  </p></details>

- [ ] **Respaldo y restauración (backup/restore)**

    <details><summary>Links</summary><p>

  - [MongoDB Backup Methods - Docs (en inglés)](https://docs.mongodb.com/manual/core/backups/)
  </p></details>

### Bases de datos

- [ ] **Modelado de datos**

- [ ] **Conexión**

### Changelog

- [ ] **Changelog: archivo que contiene una lista ordenada cronológicamente de los cambios notables para cada versión de un proyecto**

    <details><summary>Links</summary><p>

  - [Changelog guide](https://github.com/Laboratoria/changelog-guide/tree/main)
  - [Keep a changelog](https://keepachangelog.com/en/1.1.0/)
  </p></details>

### Swagger

  <details><summary>Links</summary><p>
    - [Link a la documentación - BurgerQueenAPI](https://app.swaggerhub.com/apis-docs/ssinuco/BurgerQueenAPI/2.0.0)
    - [Link a la documentación - Swagger](https://swagger.io/docs/)
  </p></details>

### Despliegue (Deployment)

  <details><summary>Links</summary><p>
  
  - [Vercel](https://vercel.com/) es una opción enfocada
    a aplicaciones web estáticas (como las que se construyen con React). Sin embargo,
    Vercel también nos permite desplegar aplicaciones node usando [Serverless
    Functions](https://vercel.com/docs/serverless-functions/introduction).
  - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
  es una muy buena opción para alojar nuestra base datos de producción, la cuál
  podemos usar en conjunción con cualquiera de las opciones mencionadas arriba.
  </p></details>

### Hacker (Devops) Edition con Docker

- [ ] **Docker-compose**
<details>
  <summary>Detalles</summary>
  <p>Lee la guía para docker incluida en el proyecto para más información. Para probar tu configuración de docker, te recomendamos usar `docker-compose` localmente (en tu computadora) para ejecutar la aplicación junto con la base de datos.</p>
</details>

- [ ] **Despliegue**
  <details>
    <summary>Detalles</summary>
    <p>Con respecto al despliegue, puedes elegir el proveedor (o proveedores) que prefieras junto con el mecanismo de despliegue y estrategia de alojamiento. Te recomendamos explorar las siguientes opciones:

  - Si quieres explorar opciones más personalizadas y ver docker del lado del servidor puedes considerar proveedores como [AWS (Amazon Web Services)](https://aws.amazon.com/) o [GCP (Google Cloud Platform)](https://cloud.google.com/), ambos tienen algún tipo de _free tier_ así como tanto _instancias_ de _servidores virtuales_ (VPS) donde configurar nuestro propio Docker o servicios para desplegar aplicaciones en contenedores (por ejemplo [Compute Engine](https://cloud.google.com/compute/docs/containers) de GCP o [Elastic Container Service](https://aws.amazon.com/ecs/) de AWS).</p>
  </details>

### Otros recursos

  <details><summary>Links</summary><p>

- [docker](https://docs.docker.com/)
- [docker compose](https://docs.docker.com/compose/)
- [¿Qué es Docker? | Curso de Docker | Platzi Cursos](https://youtu.be/hQgvt-s-AHQ)
- [Postman](https://www.getpostman.com)
- [Variable de entorno - Wikipedia](https://es.wikipedia.org/wiki/Variable_de_entorno)
- [`process.env` - Node.js docs](https://nodejs.org/api/process.html#process_process_env)
  </p></details>

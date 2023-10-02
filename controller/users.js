const { User } = require('../models/UserModel');

module.exports = {
  /**
   * @query {String} [page=1] Página del listado a consultar
   * @query {String} [limit=10] Cantitad de elementos por página
   * @header {Object} link Parámetros de paginación
   * @header {String} link.first Link a la primera página
   * @header {String} link.prev Link a la página anterior
   * @header {String} link.next Link a la página siguiente
   * @header {String} link.last Link a la última página
   * @auth Requiere `token` de autenticación y que la usuaria sea **admin**
   * @response {Array} users
   * @response {String} users[]._id
   * @response {Object} users[].email
   * @response {Object} users[].roles
   * @response {Boolean} users[].roles.admin
   * @code {200} si la autenticación es correcta
   * @code {401} si no hay cabecera de autenticación
   * @code {403} si no es ni admin
   */
  getUsers: async (req, resp, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // TODO: Implementa la función necesaria para traer la colección `users`
    try {
      // Get the total number of users in the database
      const totalUsers = await User.countDocuments();

      // Perform paginated query to retrieve users
      const users = await User.find({}).skip(startIndex).limit(limit);

      let response = [];
      response = users.map((user) => ({
        id: user._id,
        email: user.email,
        role: user.role,
      }));

      /*Add pagination link headers*/
      const totalPages = Math.ceil(totalUsers / limit);
      const baseUrl = req.protocol + '://' + req.get('host') + req.baseUrl;
      const links = {};

      if (endIndex < totalUsers) {
        links.next = `${baseUrl}?page=${page + 1}&limit=${limit}`;
        links.last = `${baseUrl}?page=${totalPages}&limit=${limit}`;
      }

      if (startIndex > 0) {
        links.prev = `${baseUrl}?page=${page - 1}&limit=${limit}`;
        links.first = `${baseUrl}?page=1&limit=${limit}`;
      }

      // Set pagination link headers in the response
      resp.setHeader('link', JSON.stringify(links));

      resp.json(response);
    } catch (error) {
      console.error('Error getting users:', error);
      next(error);
    }
  },
  /**
   * @params {String} :uid `id` o `email` de la usuaria a consultar
   * @auth Requiere `token` de autenticación y que la usuaria sea **admin** o la usuaria a consultar
   * @response {Object} user
   * @response {String} user._id
   * @response {Object} user.email
   * @response {Object} user.roles
   * @response {Boolean} user.roles.admin
   * @code {200} si la autenticación es correcta
   * @code {401} si no hay cabecera de autenticación
   * @code {403} si no es ni admin o la misma usuaria
   * @code {404} si la usuaria solicitada no existe
   */
  getUserById: async (req, resp, next) => {
    const userData = req.params.uid;
    const isEmail = userData.includes('@') ? true : false;
    try {
      const user = isEmail
        ? await User.findOne({ email: userData })
        : await User.findById(userData);
      //console.log(user);
      if (!user) {
        return next({ statusCode: 404, message: 'User not found' });
      }

      resp.json({
        id: user._id,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      next({ statusCode: error.status, message: error.message });
    }
  },
  /*-----------------createUser--------------------*/
  /**
   * @body {String} email Correo
   * @body {String} password Contraseña
   * @body {Object} [roles]
   * @body {Boolean} [roles.admin]
   * @response {Object} user
   * @response {String} user._id
   * @response {Object} user.email
   * @response {String} user.role
   * @code {200} si la autenticación es correcta
   * @code {400} si no se proveen `email` o `password` o ninguno de los dos
   * @code {401} si no hay cabecera de autenticación
   * @code {403} si ya existe usuaria con ese `email`
   */
  createUser: (req, res, next) => {
    const { email, password, role } = req.body;
    // Check if email and password are provided
    if (!email || !password) {
      return next({ statusCode: 400, message: 'Missing email or password' });
    }

    // Validate email format using regex
    const emailRegex =
      /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g;
    if (!emailRegex.test(email)) {
      return next({ statusCode: 400, message: 'Invalid email address' });
    }

    // Validate password using regex
    const passwordRegex =
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm;
    if (!passwordRegex.test(password)) {
      return next({
        statusCode: 400,
        message:
          'Invalid password. Password must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, one numeric digit, and one special character.',
      });
    }

    // Check if a user with the same email already exists
    const checkExistingUser = (email) => {
      return User.exists({ email: email });
    };

    // Check if user with the same email already exists
    checkExistingUser(email)
      .then((userExists) => {
        if (userExists) {
          return res.status(403).json({
            message: 'User with the same email already exists.',
          });
        }

        // User model-  Mongoose
        User.create({
          email,
          password,
          role,
        })
          .then((savedUser) => {
            //console.log('user-create', savedUser);
            res.status(200).json({
              id: savedUser._id,
              email: savedUser.email,
              role: savedUser.role,
            });
          })
          .catch((error) => {
            return next({ statusCode: 500 });
          });
      })
      .catch((error) => {
        return next({
          statusCode: 500,
          message: 'Error checking existing user',
        });
      });
  },
  /*----------------------DELETE----------------------------*/
  /**
    @response {Object} user
   * @response {String} user._id
   * @response {Object} user.email
   * @response {String} user.role
   * @code {200} si la autenticación es correcta
   * @code {401} si no hay cabecera de autenticación
   * @code {403} si no es ni admin o la misma usuaria
   * @code {404} si la usuaria solicitada no existe
   */
  deleteUser: (req, resp, next) => {
    const userData = req.params.uid;
    const isEmail = userData.includes('@') ? true : false;
    const query = isEmail ? { email: userData } : { _id: userData };

    //Delete
    User.deleteOne(query)
      .then(async (user) => {
        //console.log(user, 'user');
        if (user.deletedCount === 0) {
          return next({
            statusCode: 404,
            message: 'User not found',
          });
        }
        return resp.json({ message: 'User Deleted' });
      })
      .catch((error) => {
        return next({
          statusCode: 500,
          message: 'Error getting user',
        });
      });
  },
  /*-------------------------- UPDATE --------------------------*/
  /**
   * @body {String} email Correo
   * @body {String} password Contraseña
   * @body {Object} [roles]
   * @body {Boolean} [roles.admin]
   * @response {Object} user
   * @response {String} user._id
   * @response {String} user.email
   * @response {String} user.role
   * @code {200} si la autenticación es correcta
   * @code {400} si no se proveen `email` o `password` o ninguno de los dos
   * @code {401} si no hay cabecera de autenticación
   * @code {403} si no es ni admin o la misma usuaria
   * @code {403} una usuaria no admin intenta de modificar sus `roles`
   * @code {404} si la usuaria solicitada no existe
   */
  updateUser: (req, resp, next) => {
    const userData = req.params.uid;
    const isEmail = userData.includes('@') ? true : false;
    const query = isEmail ? { email: userData } : { _id: userData };
    //New Data
    const newData = req.body;
    /*
    1. validar cada propiedad (si no, lanzar excepción)
    2. consulto la colección actual
    3. modifico algunas propiedades de la colección actual
        (si no me envían alguna propiedad no la sobreescribo)
    4. guardo la colección completa
    */
    // ------Validate each property
    for (const fieldName in newData) {
      const fieldValue = newData[fieldName];
      //console.log(`Field: ${fieldName}, Value: ${fieldValue}`);
      //console.log(fieldName, typeof fieldName);

      function invalidFieldError(message) {
        return next({
          statusCode: 400,
          message: message,
        });
      }

      if (typeof fieldValue !== 'string') {
        return invalidFieldError('The value is invalid');
      }

      switch (fieldName) {
        case 'email':
          const emailRegex =
            /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g;
          if (!emailRegex.test(fieldValue)) {
            return invalidFieldError('Invalid email address');
          }
          break;

        case 'password':
          const passwordRegex =
            /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm;
          if (!passwordRegex.test(fieldValue)) {
            return invalidFieldError(
              'Invalid password. Password must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, one numeric digit, and one special character.'
            );
          }
          break;

        case 'role':
          const validRoles = ['admin', 'chef', 'waiter'];
          if (!validRoles.includes(fieldValue)) {
            return invalidFieldError('Invalid role');
          }
          break;

        default:
          return invalidFieldError('The field does not exist.');
      }
    }

    // ------Query the current collection and update the document
    User.findOneAndUpdate(query, newData, { new: true })
      .then((updateUser) => {
        if (!updateUser) {
          return next({
            statusCode: 404,
            message: 'User not found',
          });
        }
        resp.status(200).json({
          email: updateUser.email,
          password: updateUser.password,
          role: updateUser.role,
        });
      })
      .catch((error) => {
        return next({
          statusCode: 500,
          message: `Error updating product: ${error.message}`,
        });
      });
  },
};

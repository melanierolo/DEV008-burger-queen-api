const { User } = require('../models/UserModel');
const bcrypt = require('bcrypt');

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
      const totalUsers = await User.estimatedDocumentCount();

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
      const links = [];

      if (endIndex < totalUsers) {
        links.push(`<${baseUrl}?page=${page + 1}&limit=${limit}>; rel="next"`);
        links.push(
          `<${baseUrl}?page=${totalPages}&limit=${limit}>; rel="last"`
        );
      }

      if (startIndex > 0) {
        links.push(`<${baseUrl}?page=${page - 1}&limit=${limit}>; rel="prev"`);
        links.push(`<${baseUrl}?page=1&limit=${limit}>; rel="first"`);
      }
      // Set pagination link headers in the response
      resp.setHeader('link', JSON.stringify(links.join(',')));

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

    // Check if the user is authorized
    const isAdminOrSameUser =
      req.user.role === 'admin' ||
      req.user.email === userData ||
      req.userId === userData;

    if (!isAdminOrSameUser) {
      return next({
        statusCode: 403,
        message: 'Unauthorized to update this user',
      });
    }

    try {
      const user = isEmail
        ? await User.findOne({ email: userData })
        : await User.findById(userData);
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
    const { email, password } = req.body;
    let { role } = req.body;
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
    // Check role
    if (role !== 'admin' && role !== 'waiter' && role !== 'chef') {
      role = 'waiter';
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
        const newUser = {
          email: email,
          password: bcrypt.hashSync(password, 10),
          role: role,
        };

        // User model-  Mongoose
        User.create(newUser)
          .then((savedUser) => {
            res.status(200).json({
              id: savedUser._id,
              email: savedUser.email,
              role: savedUser.role,
            });
          })
          .catch((error) => {
            console.error(error.status, error.message);
            return next({ statusCode: 500 });
          });
      })
      .catch((error) => {
        console.error(error.status, error.message);
        return next({
          statusCode: 500,
          message: 'Server error - user',
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
  deleteUser: async (req, resp, next) => {
    const userData = req.params.uid;
    const isEmail = userData.includes('@');
    const query = isEmail ? { email: userData } : { _id: userData };

    // Check if the user is authorized
    const isAdminOrSameUser =
      req.user.role === 'admin' ||
      req.user.email === userData ||
      req.userId === userData;

    if (!isAdminOrSameUser) {
      return next({
        statusCode: 403,
        message: 'Unauthorized to update this user',
      });
    }
    try {
      // Check if the user exists
      const user = await User.findOne(query);
      if (!user) next({ statusCode: 404, message: 'User not found' });

      // Delete user
      const deletionResult = await User.deleteOne(query);

      if (deletionResult.deletedCount === 0) {
        return next({ statusCode: 404, message: 'User not found' });
      }

      return resp.json({ message: 'User Deleted' });
    } catch (error) {
      console.error(error);
      return next({ statusCode: 500, message: 'Server error - user' });
    }
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
  updateUser: async (req, resp, next) => {
    const userData = req.params.uid;
    const isEmail = userData.includes('@') ? true : false;
    const query = isEmail ? { email: userData } : { _id: userData };
    let newData = req.body;

    // Check if there are no values in the req.body
    if (Object.values(newData).length === 0) {
      return next({ statusCode: 400, message: 'No data provided for update' });
    }

    // Check if the user is the same user or an admin
    const isAdminOrSameUser =
      req.user.role === 'admin' ||
      req.user.email === userData ||
      req.userId === userData;

    if (!isAdminOrSameUser)
      next({ statusCode: 403, message: 'Unauthorized to update this user' });

    // Check If the user is not an admin and tries to change their own role, return 403
    if (req.user.role !== 'admin' && newData.role) {
      return next({
        statusCode: 403,
        message: 'You are not authorized to change your role',
      });
    }
    // Validate each property (email and password)
    for (const fieldName in newData) {
      const fieldValue = newData[fieldName];

      switch (fieldName) {
        case 'email':
          // Validate email format using regex
          const emailRegex =
            /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g;
          if (!emailRegex.test(fieldValue)) {
            return next({ statusCode: 400, message: 'Invalid email address' });
          }
          break;

        case 'password':
          // Validate password using regex
          const passwordRegex =
            /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm;
          if (!passwordRegex.test(fieldValue)) {
            return next({
              statusCode: 400,
              message:
                'Invalid password. Password must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, one numeric digit, and one special character.',
            });
          }
          break;

        default:
          return next({
            statusCode: 400,
            message: `Invalid field: ${fieldName}`,
          });
      }
    }

    try {
      // Check if the user exists
      const user = await User.findOne(query);
      if (!user) next({ statusCode: 404, message: 'User not found' });

      //Check If there's a new password, encrypt it
      if (newData.password) {
        newData.password = bcrypt.hashSync(newData.password, 10);
      }

      // Update user data
      const updatedUser = await User.findOneAndUpdate(query, newData, {
        new: true,
      });

      resp.json({
        id: updatedUser._id,
        email: updatedUser.email,
        role: updatedUser.role,
      });
    } catch (error) {
      console.error('Error updating user:', error.status, error.message);
      next({ statusCode: 500 });
    }
  },
};

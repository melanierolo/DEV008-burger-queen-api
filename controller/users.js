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
};

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
    // TODO: Implementa la función necesaria para traer la colección `users`
    try {
      // Perform paginated query to retrieve users
      const users = await User.find({});

      let response = [];
      response = users.map((user) => ({
        id: user._id,
        email: user.email,
        role: user.role,
      }));

      resp.json(response);
    } catch (error) {
      console.error('Error getting users:', error);
      next(error);
    }
  },
};

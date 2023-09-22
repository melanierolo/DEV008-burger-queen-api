const User = require('../models/UserModel');

module.exports = {
  getUsers: async (req, resp, next) => {
    // TODO: Implementa la función necesaria para traer la colección `users`
    const user = await User.find();
    resp.json(user);
  },
};

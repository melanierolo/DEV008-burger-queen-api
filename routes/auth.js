const { handleAuthentication } = require('../controller/auth');

/** @module auth */
module.exports = (app, nextMain) => {
  /**
   * @name /auth
   * @description Crea token de autenticación.
   *  @path {POST} /auth
   */
  app.post('/auth', handleAuthentication);

  return nextMain();
};


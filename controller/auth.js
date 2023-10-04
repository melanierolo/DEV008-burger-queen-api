const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../config');
const { User } = require('../models/UserModel');

const { secret } = config;

/**
 * @body {String} email Correo
 * @body {String} password Contraseña
 * @response {Object} resp
 * @response {String} resp.token Token a usar para los requests sucesivos
 * @code {200} si la autenticación es correcta
 * @code {400} si no se proveen `email` o `password` o ninguno de los dos
 * @auth No requiere autenticación
 */

const handleAuthentication = async (req, resp, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next({
      statusCode: 400,
      message: 'Email or password cannot be empty',
    });
  }

  // TODO: autenticar a la usuarix
  // Hay que confirmar si el email y password
  // coinciden con un user en la base de datos
  // Si coinciden, manda un access token creado con jwt
  try {
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next({
        statusCode: 401,
        message: 'Wrong password or email',
      });
    }

    const accessToken = jwt.sign({ uid: user._id }, secret, {
      expiresIn: '1h',
    });

    resp.json({ accessToken });
  } catch (error) {
    // console.error(error.status, error.message);
    next({ statusCode: error.status });
  }
};

module.exports = { handleAuthentication };

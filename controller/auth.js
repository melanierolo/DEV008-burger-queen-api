const jwt = require('jsonwebtoken');
const config = require('../config');
const { User } = require('../models/UserModel.js');
const bcrypt = require('bcrypt');

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
  console.log(email, password);
  if (!email || !password) {
    return next(400);
  }

  // TODO: autenticar a la usuarix
  // Hay que confirmar si el email y password
  // coinciden con un user en la base de datos
  // Si coinciden, manda un access token creado con jwt
  try {
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(401);
    }

    const token = jwt.sign({ uid: user._id }, secret, { expiresIn: '1h' });

    resp.json({ token });
  } catch (error) {
    next(error);
  }
};

module.exports = { handleAuthentication };

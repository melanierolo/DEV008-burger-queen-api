const jwt = require('jsonwebtoken');
const { User } = require('../models/UserModel.js');

module.exports = (secret) => (req, resp, next) => {
  const { authorization } = req.headers;
  console.log('authorization', authorization);
  if (!authorization) {
    return next();
  }

  const [type, token] = authorization.split(' ');

  if (type.toLowerCase() !== 'bearer') {
    return next();
  }

  jwt.verify(token, secret, async (err, decodedToken) => {
    if (err) {
      return next(403);
    }

    // TODO: Verificar identidad del usuario usando `decodeToken.uid`
    req.userId = decodedToken.uid; // Add user ID to request object
    const userFound = await User.findById(req.userId);
    if (!userFound) return next(404).json({ message: 'No user found' });
    req.user = {
      email: userFound.email,
      role: userFound.role,
    };
    return next();
  });
};

module.exports.isAuthenticated = (req) => {
  // TODO: decidir por la informacion del request si la usuaria esta autenticada
  const hasUserId =
    typeof req.userId !== 'undefined' &&
    req.userId !== null &&
    req.userId !== ''
      ? true
      : false;
  return hasUserId;
};

module.exports.isAdmin = (req) => {
  // TODO: decidir por la informacion del request si la usuaria es admin
  const user = req.user;
  const isAdminUser = user.role === 'admin' ? true : false;

  return isAdminUser;
};
module.exports.requireAuth = (req, resp, next) =>
  !module.exports.isAuthenticated(req) ? next(401) : next();

module.exports.requireAdmin = (req, resp, next) =>
  // eslint-disable-next-line no-nested-ternary
  !module.exports.isAuthenticated(req)
    ? next(401)
    : !module.exports.isAdmin(req)
    ? next(403)
    : next();

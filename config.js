exports.port = process.argv[2] || process.env.PORT || 8080;
exports.dbUrl =
  process.env.MONGO_URL ||
  process.env.DB_URL ||
  'mongodb://127.0.0.1:27017/DB_burguer-queen';
// Generate a random string in bash:node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
exports.secret = process.env.JWT_SECRET || 'esta-es-la-api-burger-queen';
exports.adminEmail = process.env.ADMIN_EMAIL || 'admin@localhost.com';
exports.adminPassword = process.env.ADMIN_PASSWORD || 'changeme123D+';

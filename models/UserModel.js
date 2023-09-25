const mongoose = require('mongoose');

// Define the user schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'waiter', 'chef'],
    required: true,
  },
});

// Create the 'User' model from the schema
const User = mongoose.model('user', userSchema);

// Export the model to be used in other files
module.exports = { User };

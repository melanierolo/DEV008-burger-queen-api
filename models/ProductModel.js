const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: String,
  type: String,
  dateEntry: {
    type: Date,
    default: Date.now,
  },
});
// Entity
// The first argument passed to the model should be the singular form of your collection name.
// Mongoose automatically changes this to the plural form, transforms it to lowercase
const Product = new mongoose.model('Product', productSchema);

module.exports = { Product };

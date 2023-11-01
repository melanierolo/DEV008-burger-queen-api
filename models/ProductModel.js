const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
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
// The first argument passed to the model should start with an uppercase letter,
// as Mongoose automatically converts it to lowercase and pluralizes it.
const Product = mongoose.model('Product', productSchema);

module.exports = { Product };

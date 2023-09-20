const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const productSchema = new mongoose.Schema({
  _id: ObjectId,
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
const Product = new mongoose.model('products', productSchema);

module.exports = { Product };

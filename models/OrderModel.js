const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new mongoose.Schema({
  userId: {
    type: Schema.ObjectId,
    ref: 'User', // This references the 'users' collection
  },
  client: {
    type: String,
    required: true,
  },
  products: [
    {
      qty: Number,
      product: {
        type: Schema.ObjectId,
        ref: 'Product', // This references the 'products' collection
      },
    },
  ],
  status: {
    type: String,
    enum: ['pending', 'canceled', 'preparing', 'delivering', 'delivered'],
    default: 'pending',
  },
  dateEntry: {
    type: Date,
    default: Date.now,
  },
  dateProcessed: {
    type: Date,
    default: Date.now,
  },
});

// Entity
// The first argument passed to the model should start with an uppercase letter,
// as Mongoose automatically converts it to lowercase and pluralizes it.
const Order = mongoose.model('Order', orderSchema);

module.exports = { Order };

const { Order } = require('../models/OrderModel');
const { User } = require('../models/UserModel');
const { Product } = require('../models/ProductModel');

/* --------------------- Create a order ---------------------*/
/**
 * @body {String} userId Id usuaria que creó la orden
 * @body {String} client Clienta para quien se creó la orden
 * @body {Array} products Productos
 * @body {Object} products[] Producto
 * @body {String} products[].productId Id de un producto
 * @body {Number} products[].qty Cantidad de ese producto en la orden
 * @response {Object} order
 * @response {String} order._id Id
 * @response {String} order.userId Id usuaria que creó la orden
 * @response {String} order.client Clienta para quien se creó la orden
 * @response {Array} order.products Productos
 * @response {Object} order.products[] Producto
 * @response {Number} order.products[].qty Cantidad
 * @response {Object} order.products[].product Producto
 * @response {String} order.status Estado: `pending`, `canceled`, `delivering` o `delivered`
 * @response {Date} order.dateEntry Fecha de creación
 * @response {Date} [order.dateProcessed] Fecha de cambio de `status` a `delivered`
 * @code {200} si la autenticación es correcta
 * @code {400} no se indica `userId` o se intenta crear una orden sin productos
 * @code {401} si no hay cabecera de autenticación
 */
const createOrder = async (req, resp, next) => {
  const { userId, client, products, status, dateEntry } = req.body;
  console.log('data:', userId, client, products);
  // Define a function to check if a value is a string
  const isString = (value) => typeof value === 'string' && value.trim() !== '';

  // Define a function to check if a value is a valid product
  const isValidProduct = (product) =>
    typeof product === 'object' && product !== null;

  if (!userId || !products) {
    return next({ statusCode: 400, message: 'Invalid request body-a1' });
  }
  if (!isString(userId) || !Array.isArray(products) || products.length === 0) {
    next({ statusCode: 400, message: 'Invalid request body-a2' });
  }

  products.forEach((product) => {
    console.log(
      'product',
      !isValidProduct(product) ||
        typeof product.qty !== 'number' ||
        product.qty <= 0,
      !isValidProduct(product),
      typeof product.qty !== 'number',
      product.qty <= 0
    );
    if (
      !isValidProduct(product) ||
      typeof product.qty !== 'number' ||
      product.qty <= 0
    ) {
      next({ statusCode: 400, message: 'Invalid request body -a3' });
    }
  });

  try {
    // Ensure the user exists
    const user = await User.findById(userId);
    if (!user) {
      next({ statusCode: 400, message: 'Invalid request body userId' });
    }

    // Ensure that all provided product IDs exist
    const productIds = products.map((product) => product.product.id);

    const existingProducts = await Product.find({ _id: { $in: productIds } });
    if (existingProducts.length !== productIds.length) {
      return next({ statusCode: 400, message: 'Invalid product IDs' });
    }

    // Create a new order
    const newOrder = new Order({
      userId,
      client: client || 'client',
      products: products.map((product) => ({
        qty: product.qty,
        product: product.product.id,
      })),
      status: status || 'pending', // Set a default value if status is empty
    });

    // Save the order to the database
    await newOrder.save();

    // Populate the products field
    const populatedOrder = await Order.findById(newOrder._id).populate(
      'products.product'
    );

    resp.json({
      id: populatedOrder._id,
      userId: populatedOrder.userId,
      client: populatedOrder.client,
      products: populatedOrder.products,
      status: populatedOrder.status,
      dateEntry: populatedOrder.dateEntry,
      dateProcessed: populatedOrder.dateProcessed,
    });
  } catch (error) {
    // Handle any errors
    console.error(error.status, error.message);
    next({ statusCode: 500 });
  }
};

module.exports = {
  createOrder,
};

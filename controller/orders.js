const { Order } = require('../models/OrderModel');
const { User } = require('../models/UserModel');
const { Product } = require('../models/ProductModel');
const orders = require('../routes/orders');

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

/*-----------------getOrders----------------------*/
/**
 * @query {String} [page=1] Página del listado a consultar
 * @query {String} [limit=10] Cantitad de elementos por página
 * @header {Object} link Parámetros de paginación
 * @header {String} link.first Link a la primera página
 * @header {String} link.prev Link a la página anterior
 * @header {String} link.next Link a la página siguiente
 * @header {String} link.last Link a la última página
 * @response {Array} orders
 * @response {String} orders[]._id Id
 * @response {String} orders[].userId Id usuaria que creó la orden
 * @response {String} orders[].client Clienta para quien se creó la orden
 * @response {Array} orders[].products Productos
 * @response {Object} orders[].products[] Producto
 * @response {Number} orders[].products[].qty Cantidad
 * @response {Object} orders[].products[].product Producto
 * @response {String} orders[].status Estado: `pending`, `canceled`, `delivering` o `delivered`
 * @response {Date} orders[].dateEntry Fecha de creación
 * @response {Date} [orders[].dateProcessed] Fecha de cambio de `status` a `delivered`
 * @code {200} si la autenticación es correcta
 * @code {401} si no hay cabecera de autenticación
 */

const getOrders = async (req, resp, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  try {
    // Get the total number of orders in the database
    const totalOrders = await Order.estimatedDocumentCount();

    // Perform paginated query to retrieve orders with populated products
    const orders = await Order.find({})
      .populate({
        path: 'products',
        populate: {
          path: 'product',
          model: 'Product',
        },
      })
      .skip(startIndex)
      .limit(limit);

    const response = orders.map((order) => ({
      id: order._id,
      userId: order.userId,
      client: order.client,
      products: order.products.map((productItem) => ({
        qty: productItem.qty,
        product: {
          id: productItem.product._id,
          name: productItem.product.name,
          price: productItem.product.price,
          image: productItem.product.image,
          type: productItem.product.type,
          dateEntry: productItem.product.dateEntry,
        },
      })),
      status: order.status,
      dataEntry: order.dateEntry,
      dateProcessed: order.dateProcessed,
    }));

    /*Add pagination link headers*/
    const totalPages = Math.ceil(totalOrders / limit);
    const baseUrl = req.protocol + '://' + req.get('host') + req.baseUrl;
    const links = {};

    if (startIndex > 0) {
      links.prev = `${baseUrl}?page=${page - 1}&limit=${limit}`;
      links.first = `${baseUrl}?page=1&limit=${limit}`;
    }

    if (endIndex > orders.length) {
      links.next = `${baseUrl}?page=${page + 1}&limit=${limit}`;
      links.last = `${baseUrl}?page=${totalPages}&limit=${limit}`;
    }

    // Set pagination link headers in the response
    resp.setHeader('link', JSON.stringify(links));
    console.log(response);
    // Send the list of orders as a JSON response
    resp.json(response);
  } catch (error) {
    console.error('Error getting orders:', error.status, error.message);
    next({ statusCode: 500 }); // Pass the error to the error handling middleware
  }
};

module.exports = {
  createOrder,
  getOrders,
};

const { Order } = require('../models/OrderModel');
const { User } = require('../models/UserModel');
const { Product } = require('../models/ProductModel');
const { Types } = require('mongoose');
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
      dateEntry: order.dateEntry,
      dateProcessed: order.dateProcessed,
    }));

    /*Add pagination link headers*/
    const totalPages = Math.ceil(totalOrders / limit);
    const baseUrl = req.protocol + '://' + req.get('host') + req.baseUrl;
    const links = [];

    if (startIndex > 0) {
      links.push(`<${baseUrl}?page=${page - 1}&limit=${limit}>; rel="prev"`);
      links.push(`<${baseUrl}?page=1&limit=${limit}>; rel="first"'`);
    }

    if (endIndex < totalOrders) {
      links.push(`<${baseUrl}?page=${page + 1}&limit=${limit}>; rel="next"`);
      links.push(`<${baseUrl}?page=${totalPages}&limit=${limit}>; rel="last"`);
    }

    // Set pagination link headers in the response
    resp.setHeader('link', JSON.stringify(links.join(',')));

    // Send the list of orders as a JSON response
    resp.json(response);
  } catch (error) {
    console.error('Error getting orders:', error.status, error.message);
    next({ statusCode: 500 }); // Pass the error to the error handling middleware
  }
};

/*---------------------getOrder:uid----------------------*/
/**
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
 * @code {401} si no hay cabecera de autenticación
 * @code {404} si la orden con `orderId` indicado no existe
 */
const getOrderById = async (req, resp, next) => {
  const orderId = req.params.orderId;
  try {
    // Validation of orderId
    if (!Types.ObjectId.isValid(orderId)) {
      return next({ statusCode: 404 });
    }

    // Populate the products field
    const populatedOrder = await Order.findById(orderId).populate(
      'products.product'
    );

    if (!populatedOrder) {
      return next({ statusCode: 404, message: 'Order not found' });
    }

    resp.json({
      id: populatedOrder._id,
      userId: populatedOrder.userId,
      client: populatedOrder.client,
      products: populatedOrder.products.map((productItem) => ({
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
      status: populatedOrder.status,
      dateEntry: populatedOrder.dateEntry,
      dateProcessed: populatedOrder.dateProcessed,
    });
  } catch (error) {
    console.error('Error getting orders:', error.message, error.status);
    next({ statusCode: 500 }); // Pass the error to the error handling middleware
  }
};

/*---------------------DELETE----------------------------*/
/**
 * @params {String} :orderId `id` del producto
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
 * @code {401} si no hay cabecera de autenticación
 * @code {404} si el producto con `orderId` indicado no existe
 */
const deleteOrder = async (req, resp, next) => {
  const orderId = req.params.orderId;
  try {
    // Validation of orderId
    if (!Types.ObjectId.isValid(orderId)) {
      return next({ statusCode: 404 });
    }

    const orderFound = await Order.findById(orderId);
    if (!orderFound) return next({ statusCode: 404 });

    // Populate the products field
    const populatedOrder = await Order.findByIdAndDelete(orderId).populate(
      'products.product'
    );

    if (populatedOrder.deletedCount === 0) {
      return next({ statusCode: 404, message: 'Order not found' });
    }

    resp.json({
      id: populatedOrder._id,
      userId: populatedOrder.userId,
      client: populatedOrder.client,
      products: populatedOrder.products.map((productItem) => ({
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
      status: populatedOrder.status,
      dateEntry: populatedOrder.dateEntry,
    });
  } catch (error) {
    console.error('Error getting orders:', error.message, error.status);
    next({ statusCode: 500 }); // Pass the error to the error handling middleware
  }
};

/* -------------------UPDATE------------------------------*/
/**
 * @body {String} [userId] Id usuaria que creó la orden
 * @body {String} [client] Clienta para quien se creó la orden
 * @body {Array} [products] Productos
 * @body {Object} products[] Producto
 * @body {String} products[].productId Id de un producto
 * @body {Number} products[].qty Cantidad de ese producto en la orden
 * @body {String} [status] Estado: `pending`, `canceled`, `delivering` o `delivered`
 * @response {Object} order
 * @response {String} order._id Id
 * @response {String} order.userId Id usuaria que creó la orden
 * @response {Array} order.products Productos
 * @response {Object} order.products[] Producto
 * @response {Number} order.products[].qty Cantidad
 * @response {Object} order.products[].product Producto
 * @response {String} order.status Estado: `pending`, `canceled`, `delivering` o `delivered`
 * @response {Date} order.dateEntry Fecha de creación
 * @response {Date} [order.dateProcessed] Fecha de cambio de `status` a `delivered`
 * @code {200} si la autenticación es correcta
 * @code {400} si no se indican ninguna propiedad a modificar o la propiedad `status` no es valida
 * @code {401} si no hay cabecera de autenticación
 * @code {404} si la orderId con `orderId` indicado no existe
 */
const updateOrder = async (req, resp, next) => {
  const orderId = req.params.orderId;
  const { status } = req.body;

  // Check if req.body is empty
  if (Object.values(req.body).length === 0) {
    return next({ statusCode: 400 });
  }
  // Check status
  if (status !== undefined && status !== null) {
    if (
      typeof status !== 'string' ||
      status.trim() === '' ||
      !(
        status === 'pending' ||
        status === 'canceled' ||
        status === 'preparing' ||
        status === 'delivering' ||
        status === 'delivered'
      )
    ) {
      return next({ statusCode: 400, message: 'Invalid field' });
    }
  }

  try {
    // Validation of orderId
    if (!Types.ObjectId.isValid(orderId)) {
      return next({ statusCode: 404, message: 'Order not found' });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return next({ statusCode: 404, message: 'Order not found' });
    }

    // Update and populate the products field
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status: status, dateProcessed: new Date() },
      { new: true }
    ).populate('products.product');

    resp.json({
      id: updatedOrder._id,
      userId: updatedOrder.userId,
      client: updatedOrder.client,
      products: updatedOrder.products.map((productItem) => ({
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
      status: updatedOrder.status,
      dateEntry: updatedOrder.dateEntry,
      dateProcessed: updatedOrder.dateProcessed,
    });
  } catch (error) {
    console.error('Error in updating the order', error.status, error.message);
    next({ statusCode: 500 });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  deleteOrder,
  updateOrder,
};

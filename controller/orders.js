const { Order } = require('../models/ProductModel');

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
const createOrder = async (req, res, next) => {};

module.exports = {
  createOrder,
};

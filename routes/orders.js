const { requireAuth } = require('../middleware/auth');
const {
  createOrder,
  getOrders,
  getOrderById,
  deleteOrder,
  updateOrder,
} = require('../controller/orders');

/** @module orders */
module.exports = (app, nextMain) => {
  /**
   * @name GET /orders
   * @description Lista órdenes
   * @path {GET} /orders
   * @auth Requiere `token` de autenticación
   */
  app.get('/orders', requireAuth, getOrders);

  /**
   * @name GET /orders/:orderId
   * @description Obtiene los datos de una orden especifico
   * @path {GET} /orders/:orderId
   * @params {String} :orderId `id` de la orden a consultar
   * @auth Requiere `token` de autenticación
   */
  app.get('/orders/:orderId', requireAuth, getOrderById);

  /**
   * @name POST /orders
   * @description Crea una nueva orden
   * @path {POST} /orders
   * @auth Requiere `token` de autenticación
   */
  app.post('/orders', requireAuth, createOrder);

  /**
   * @name PATCH /orders
   * @description Modifica una orden
   * @path {PATCH} /products
   * @params {String} :orderId `id` de la orden
   * @auth Requiere `token` de autenticación
   */
  app.patch('/orders/:orderId', requireAuth, updateOrder);

  /**
   * @name DELETE /orders
   * @description Elimina una orden
   * @path {DELETE} /orders
   * @auth Requiere `token` de autenticación
   */
  app.delete('/orders/:orderId', requireAuth, deleteOrder);

  nextMain();
};

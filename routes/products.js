const {
  getProducts,
  getProductById,
  createProduct,
  deleteProduct,
  updateProduct,
} = require('../controller/products');
const { requireAuth, requireAdmin } = require('../middleware/auth');

/** @module products */
module.exports = (app, nextMain) => {
  /**
   * @name GET /products
   * @description Lista productos
   * @path {GET} /products
   **/

  app.get('/products', requireAuth, getProducts);

  /**
   * @name GET /products/:productId
   * @description Obtiene los datos de un producto especifico
   * @path {GET} /products/:productId
   */

  app.get('/products/:productId', requireAuth, getProductById);

  /**
   * @name POST /products
   * @description Crea un nuevo producto
   * @path {POST} /products
   */
  app.post('/products', requireAdmin, createProduct);

  /**
   * @name PUT /products
   * @description Modifica un producto
   * @path {PUT} /products
   * @params {String} :productId `id` del producto
   * @auth Requiere `token` de autenticación y que el usuario sea **admin**
   */
  app.put('/products/:productId', requireAdmin, updateProduct);

  /**
   * @name DELETE /products
   * @description Elimina un producto
   * @path {DELETE} /products
   * @params {String} :productId `id` del producto
   * @auth Requiere `token` de autenticación y que el usuario sea **admin**
   */
  app.delete('/products/:productId', requireAdmin, deleteProduct);

  nextMain();
};

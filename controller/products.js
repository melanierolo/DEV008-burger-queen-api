const { connect } = require('../connect.js');

/*---------------------- Function to get a list of products ----------------------*/
/**
 * @query {String} [page=1] Página del listado a consultar
 * @query {String} [limit=10] Cantitad de elementos por página
 * @header {Object} link Parámetros de paginación
 * @header {String} link.first Link a la primera página
 * @header {String} link.prev Link a la página anterior
 * @header {String} link.next Link a la página siguiente
 * @header {String} link.last Link a la última página
 * @auth Requiere `token` de autenticación
 * @response {Array} products
 * @response {String} products[]._id Id
 * @response {String} products[].name Nombre
 * @response {Number} products[].price Precio
 * @response {URL} products[].image URL a la imagen
 * @response {String} products[].type Tipo/Categoría
 * @response {Date} products[].dateEntry Fecha de creación
 * @code {200} si la autenticación es correcta
 * @code {401} si no hay cabecera de autenticación
 */
const getProducts = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  try {
    const database = await connect();
    const productsCollection = database.collection('products');
    const products = await productsCollection.find({}).toArray();
    const numberOfPages = Math.ceil(products.length / limit);
    const response = {};

    response.pagination = {
      page: page,
      pageSize: limit,
      numberOfPages: numberOfPages,
    };

    if (startIndex > 0) {
      response.link = {
        first: `/products?page=1&limit=${limit}`,
        prev: `/products?page=${page - 1}&limit=${limit}`,
      };
    }

    if (endIndex < products.length) {
      response.link = {
        ...response.link,
        next: `/products?page=${page + 1}&limit=${limit}`,
        last: `/products?page=${numberOfPages}&limit=${limit}`,
      };
    }

    response.result = products.slice(startIndex, endIndex).map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      type: product.type,
      dateEntry: product.dateEntry,
    }));
    res.json(response); // Send the list of products as a JSON response
  } catch (error) {
    console.error('Error getting products:', error);
    next(error); // Pass the error to the error handling middleware
  }
};
module.exports = {
  getProducts,
};

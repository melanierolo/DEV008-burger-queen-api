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
      id: product._id,
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

/**
 * @params {String} :productId `id` del producto
 * @auth Requiere `token` de autenticación
 * @response {Object} product
 * @response {String} product._id Id
 * @response {String} product.name Nombre
 * @response {Number} product.price Precio
 * @response {URL} product.image URL a la imagen
 * @response {String} product.type Tipo/Categoría
 * @response {Date} product.dateEntry Fecha de creación
 * @code {200} si la autenticación es correcta
 * @code {401} si no hay cabecera de autenticación
 * @code {404} si el producto con `productId` indicado no existe
 **/

const getProductById = async (req, res, next) => {
  const productId = req.params.productId;
  const database = await connect();
  const productsCollection = database.collection('products');
  console.log(productId);
  try {
    const product = await productsCollection.findOne({ id: productId });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error getting products:', error);
    next(error); // Pass the error to the error handling middleware
  }
};

/* --------------------- Create a product ---------------------*/
/**
 * @auth Requiere `token` de autenticación y que la usuaria sea **admin**
 * @body {String} name Nombre
 * @body {Number} price Precio
 * @body {String} [imagen]  URL a la imagen
 * @body {String} [type] Tipo/Categoría
 * @response {Object} product
 * @response {String} products._id Id
 * @response {String} product.name Nombre
 * @response {Number} product.price Precio
 * @response {URL} product.image URL a la imagen
 * @response {String} product.type Tipo/Categoría
 * @response {Date} product.dateEntry Fecha de creación
 * @code {200} si la autenticación es correcta
 * @code {400} si no se indican `name` o `price`
 * @code {401} si no hay cabecera de autenticación
 * @code {403} si no es admin
 * @code {404} si el producto con `productId` indicado no existe
 **/

const createProduct = async (req, res, next) => {
  const { id, name, price, image, type } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: 'Name and price are required' });
  }

  try {
    const database = await connect();
    const productsCollection = database.collection('products');

    const newProduct = {
      name,
      price,
      image,
      type,
      dateEntry: new Date(),
    };

    const result = await productsCollection.insertOne(newProduct);
    res.json(result);
  } catch (error) {
    console.error('Error getting products:', error);
    next(error); // Pass the error to the error handling middleware
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
};

const { Product } = require('../models/ProductModel');
const { Types } = require('mongoose');

// ---------------------- Function to get a list of products ----------------------
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
const getProducts = async (req, resp, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  try {
    // Get the total number of products in the database
    const totalProducts = await Product.estimatedDocumentCount();

    // Perform paginated query to retrieve products
    const products = await Product.find({}).skip(startIndex).limit(limit);
    let response = [];

    response = products.map((product) => ({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      type: product.type,
      dateEntry: product.dateEntry,
    }));

    /*Add pagination link headers*/
    const totalPages = Math.ceil(totalProducts / limit);
    const baseUrl = req.protocol + '://' + req.get('host') + req.baseUrl;
    const links = [];

    if (startIndex > 0) {
      links.push(`<${baseUrl}?page=${page - 1}&limit=${limit}>; rel="prev"`);
      links.push(`<${baseUrl}?page=1&limit=${limit}>; rel="first"'`);
    }

    if (endIndex < totalProducts) {
      links.push(`<${baseUrl}?page=${page + 1}&limit=${limit}>; rel="next"`);
      links.push(`<${baseUrl}?page=${totalPages}&limit=${limit}>; rel="last"`);
    }
    // Set pagination link headers in the response
    resp.setHeader('link', JSON.stringify(links.join(',')));

    // Send the list of products as a JSON response
    resp.json(response);
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
  try {
    // Validation of productId
    if (!Types.ObjectId.isValid(productId)) {
      return next({ statusCode: 404 });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return next({ statusCode: 404, message: 'Product not found' });
    }

    res.json({
      id: product._id,
      name: product.name,
      price: product.image,
      type: product.type,
      dataEntry: product.dateEntry,
    });
  } catch (error) {
    console.error('Error getting products:', error.message, error.status);
    next({ statusCode: 500 }); // Pass the error to the error handling middleware
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
  const { name, price } = req.body;
  let { image, type } = req.body;
  // console.log(name, price);
  if (!name || !price) {
    return next({ statusCode: 400, message: 'Name and price are required' });
  }

  if (typeof name !== 'string' || typeof price !== 'number' || price < 0) {
    return next({ statusCode: 400 });
  }

  if (!image || typeof image !== 'string') {
    image = '';
  }
  if (!type || typeof type !== 'string') {
    type = '';
  }

  try {
    const newProduct = {
      name,
      price,
      image,
      type,
      dateEntry: new Date(),
    };

    const product_1 = new Product(newProduct);
    let product1Id = '';
    product_1
      .save()
      .then((result) => {
        product1Id = result._id.toString();
        return res.send({
          _id: product1Id,
          name: result.name,
          price: result.price,
          image: result.image,
          type: result.type,
          dateEntry: result.dateEntry,
        });
      })
      .catch((error) => {
        return next({ statusCode: 500 });
      });
  } catch (error) {
    console.error('Error getting products:', error);
    next(error); // Pass the error to the error handling middleware
  }
};

/* -------------------UPDATE------------------------------*/
/**
 * @body {String} [name] Nombre
 * @body {Number} [price] Precio
 * @body {String} [imagen]  URL a la imagen
 * @body {String} [type] Tipo/Categoría
 * @response {Object} product
 * @response {String} product._id Id
 * @response {String} product.name Nombre
 * @response {Number} product.price Precio
 * @response {URL} product.image URL a la imagen
 * @response {String} product.type Tipo/Categoría
 * @response {Date} product.dateEntry Fecha de creación
 * @code {200} si la autenticación es correcta
 * @code {400} si no se indican ninguna propiedad a modificar
 * @code {401} si no hay cabecera de autenticación
 * @code {403} si no es admin
 * @code {404} si el producto con `productId` indicado no existe
 */
const updateProduct = async (req, res, next) => {
  const productId = req.params.productId;
  const { name, price, image, type } = req.body;

  // Check if req.body is empty
  if (Object.values(req.body).length === 0) {
    return next({ statusCode: 400 });
  }

  // Validation of name
  if (name !== undefined && name !== null) {
    if (typeof name !== 'string' || name.trim() === '') {
      return next({ statusCode: 400, message: 'Invalid field' });
    }
  }

  // Validation of price
  if (price !== undefined && price !== null) {
    if (
      typeof price !== 'number' ||
      isNaN(price) ||
      !Number.isFinite(price) ||
      price <= 0
    ) {
      return next({ statusCode: 400, message: 'Invalid field' });
    }
  }

  // Validation of image
  if (image !== undefined && image !== null) {
    if (typeof image !== 'string') {
      return next({ statusCode: 400, message: 'Invalid field' });
    }
  }

  // Validation of type
  if (type !== undefined && type !== null) {
    if (typeof type !== 'string') {
      return next({ statusCode: 400, message: 'Invalid field' });
    }
  }

  try {
    // Validation of productId
    if (!Types.ObjectId.isValid(productId)) {
      return next({ statusCode: 404 });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return next({ statusCode: 404, message: 'Product not found' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { name, price, image, type },
      { new: true }
    );

    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    next(error);
  }
};

/* ------------------- DELETE ------------------------- */
/** 
    @response {Object} product
   * @response {String} product._id Id
   * @response {String} product.name Nombre
   * @response {Number} product.price Precio
   * @response {URL} product.image URL a la imagen
   * @response {String} product.type Tipo/Categoría
   * @response {Date} product.dateEntry Fecha de creación
   * @code {200} si la autenticación es correcta
   * @code {401} si no hay cabecera de autenticación
   * @code {403} si no es ni admin
   * @code {404} si el producto con `productId` indicado no existe
**/

const deleteProduct = async (req, resp, next) => {
  const productId = req.params.productId;

  try {
    if (!Types.ObjectId.isValid(productId)) {
      return next({ statusCode: 404 });
    }

    const productFound = await Product.findById(productId);

    if (!productFound) {
      return next({ statusCode: 404, message: 'Product not found' });
    }

    const result = await Product.findByIdAndDelete(productId);

    if (result.deletedCount === 0) {
      return next({ statusCode: 404, message: 'Product not found' });
    }

    const { _id, name, price, image, type, dateEntry } = result;

    resp.json({ _id, name, price, image, type, dateEntry });
  } catch (error) {
    return next({ statusCode: 500 });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  deleteProduct,
  updateProduct,
};

import asyncHandler from "../middleWare/asyncHandler.js"
import Product from "../models/productModel.js"
import Order from "../models/orderModel.js"
import sanitizeHtml from 'sanitize-html';

// @desc Fetch all products
// @route GET /api/products
// @access Public
export const getProducts = asyncHandler(async (req, res) => {
   // const products = await Product.find({})
   // res.json(products)
   const pageSize = process.env.PAGINATION_LIMIT;
   const page = Number(req.query.pageNumber) || 1;

   const keyword = req.query.keyword ? {
      name: {
         $regex: req.query.keyword,
         $options: 'i',
      },
   } : {};

   const brand = req.query.brand ? { brand: req.query.brand } : {};
   const rating = req.query.rating ? { rating: { $gte: Number(req.query.rating) } } : {};
   const minPrice = req.query.minPrice ? { price: { $gte: Number(req.query.minPrice) } } : {};
   const maxPrice = req.query.maxPrice ? { price: { $lte: Number(req.query.maxPrice) } } : {};

   const category = req.query.category ? {
      $or: [{ 'category.slug': req.query.category }]
   } : {}

   const subcategory = req.query.subcategory ? {
      $or: [{ 'subcategory.slug': req.query.subcategory }]
   } : {};

   const isAmazingOffer = req.query.isAmazingOffer === 'true' ? { isAmazingOffer: true } : {};

   // Combine all filters into a single query object
   const query = { ...keyword, ...brand, ...rating, ...minPrice, ...maxPrice, ...category, ...subcategory, ...isAmazingOffer };

   const sortBy = req.query.sortBy || '-createdAt';

   const count = await Product.countDocuments(query);
   const products = await Product.find(query)
      .sort(sortBy)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

   res.json({ products, page, pages: Math.ceil(count / pageSize) });
})

// @desc Fetch all products for admin
// @route GET /api/products
// @access Private/Admin
export const getAdminProducts = asyncHandler(async (req, res) => {
   const pageSize = process.env.PAGINATION_LIMIT_ADMIN;
   const page = Number(req.query.pageNumber) || 1;

   const keyword = req.query.keyword
      ? {
         name: {
            $regex: req.query.keyword,
            $options: 'i',
         },
      }
      : {};

   const sortBy = req.query.sortBy || '-createdAt';

   const count = await Product.countDocuments({ ...keyword });
   const products = await Product.find({ ...keyword })
      .sort(sortBy)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

   res.json({ products, page, pages: Math.ceil(count / pageSize) });
});

// @desc Fetch a product
// @route GET /api/products/:id
// @access Public
export const getProduct = asyncHandler(async (req, res) => {
   const product = await Product.findById(req.params.id)

   if (product) {
      return res.json(product)
   } else {
      res.status(404)
      throw new Error('Recource not found')
   }
})

// @desc Create a product
// @route POST /api/products
// @access Private/Admin
export const createProducts = asyncHandler(async (req, res) => {
   const product = new Product({
      name: 'Sample name',
      price: 0,
      priceWithOff: 0,
      discount: 0,
      isAmazingOffer: false,
      user: req.user._id,
      image: '/image/sample.jpg',
      brand: 'Sample brand',
      category: {
         name: 'sample',
         slug: 'sample'
      },
      subcategory: {
         name: '',
         slug: ''
      },
      countInStock: 0,
      numReviews: 0,
      description: 'Sample description',
   })

   const createdProduct = await product.save()
   res.status(201).json(createdProduct)
})

// @desc Update a product
// @route PUT /api/products/:id
// @access Private/Admin
export const updateProduct = asyncHandler(async (req, res) => {
   const { name, price, priceWithOff, isAmazingOffer, discount, image, brand, category, subcategory, countInStock, description } = req.body

   const cleanDescription = sanitizeHtml(description);
   const product = await Product.findById(req.params.id)

   if (product) {
      product.name = name
      product.price = price
      product.priceWithOff = priceWithOff
      product.discount = discount
      product.isAmazingOffer = isAmazingOffer
      product.image = image
      product.brand = brand
      product.category = category
      product.subcategory = subcategory
      product.countInStock = countInStock
      product.description = cleanDescription

      const updatedProduct = await product.save()
      res.json(updatedProduct)
   } else {
      res.status(404)
      throw new Error('Resourse not found.')
   }
})

// @desc Delete a product
// @route DELETE /api/products/:id
// @access Private/Admin
export const deleteProduct = asyncHandler(async (req, res) => {
   const product = await Product.findById(req.params.id)

   if (product) {
      await Product.deleteOne({ _id: product._id })
      res.status(200).json({ message: 'Product deleted!' })
   } else {
      res.status(404)
      throw new Error('Resourse not found.')
   }
})

// @desc Create a new review
// @route POST /api/products/:id/reviews
// @access Private
export const createProductReview = asyncHandler(async (req, res) => {
   const { rating, comment } = req.body
   const product = await Product.findById(req.params.id)

   if (product) {
      const alreadyReviewed = product.reviews.find(
         (review) => review.user.toString() === req.user._id.toString()
      )

      if (alreadyReviewed) {
         res.status(400)
         throw new Error('Product alredy reviewed')
      }

      const review = {
         name: req.user.name,
         rating: Number(rating),
         comment,
         user: req.user._id
      }

      product.reviews.push(review)

      product.numReviews = product.reviews.length

      product.rating = product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length

      await product.save()
      res.status(201).json({ message: 'Review added' })
   } else {
      res.status(404)
      throw new Error('Resourse not found.')
   }
})

// @desc Get top selling products
// @route GET /api/products/top
// @access Public
export const getTopSellingProducts = asyncHandler(async (req, res) => {
   // Aggregate to calculate the total quantity of each product in orders
   const topProducts = await Order.aggregate([
      { $unwind: "$orderItems" }, // Decompose orderItems array
      {
         $group: {
            _id: "$orderItems.product",
            totalSold: { $sum: "$orderItems.qty" }
         }
      },
      { $sort: { totalSold: -1 } }, // Sort by totalSold in descending order
      { $limit: 6 } // Limit to top 6 products
   ]);

   // Populate the product details and add the totalSold count
   const productIds = topProducts.map(p => p._id);
   const products = await Product.find({ _id: { $in: productIds } });

   // Create a map of product ID to totalSold
   const productSalesMap = topProducts.reduce((map, product) => {
      map[product._id] = product.totalSold;
      return map;
   }, {});

   // Attach the totalSold to each product
   const productsWithSales = products.map(product => ({
      ...product.toObject(),
      totalSold: productSalesMap[product._id] || 0
   }));

   // Sort products by totalSold
   productsWithSales.sort((a, b) => b.totalSold - a.totalSold);

   res.status(200).json(productsWithSales);
});
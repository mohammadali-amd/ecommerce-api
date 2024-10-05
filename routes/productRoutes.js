import express from 'express'
import { admin, protect } from '../middleWare/authMiddleware.js'
import { createProductReview, createProducts, deleteProduct, getProduct, getProducts, updateProduct, getTopSellingProducts, getAdminProducts } from '../controllers/productController.js'
import checkObjectId from '../middleWare/checkObjectId.js'

const router = express.Router()

router.route('/')
   .get(getProducts)
   .post(protect, admin, createProducts)

router.route('/admin')
   .get(getAdminProducts)
   .post(protect, admin, createProducts)

router.route('/top')
   .get(getTopSellingProducts)

router.route('/:id')
   .get(getProduct, checkObjectId)
   .put(protect, admin, checkObjectId, updateProduct)
   .delete(protect, admin, checkObjectId, deleteProduct)

router.route('/:id/reviews')
   .post(protect, checkObjectId, createProductReview)

export default router
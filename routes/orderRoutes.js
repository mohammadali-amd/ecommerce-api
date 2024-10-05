import express from 'express'
import { admin, protect } from '../middleWare/authMiddleware.js'
import { addOrderItems, getMyOrders, getOrderById, updateOrderToPaid, updateOrderToDeliveres, getOrders } from '../controllers/orderController.js'

const router = express.Router()

router.route('/')
   .post(protect, addOrderItems)
   .get(protect, admin, getOrders)

router.route('/myorders')
   .get(protect, getMyOrders)

router.route('/:id')
   .get(protect, getOrderById)

router.route('/:id/pay')
   .put(protect, updateOrderToPaid)

router.route('/:id/deliver')
   .put(protect, updateOrderToDeliveres)

export default router
import asyncHandler from "../middleWare/asyncHandler.js"
import Order from "../models/orderModel.js"
import Product from "../models/productModel.js"
import { calcPrices } from '../utils/calcPrices.js';

// @desc Create new order
// @route POST /api/orders
// @access Private
export const addOrderItems = asyncHandler(async (req, res) => {
   const { orderItems, shippingAddress, paymentMethod } = req.body;

   if (!orderItems || orderItems.length === 0) {
      res.status(400);
      throw new Error('No order items');
   }

   // Get the ordered items from the database
   const itemsFromDB = await Product.find({
      _id: { $in: orderItems.map(x => x._id) },
   });

   // Map over the order items and use the price from the items from the database
   const dbOrderItems = orderItems.map((itemFromClient) => {
      const matchingItemFromDB = itemsFromDB.find(
         (itemFromDB) => itemFromDB._id.toString() === itemFromClient._id
      );
      return {
         ...itemFromClient,
         product: itemFromClient._id,
         price: matchingItemFromDB.price,
         image: matchingItemFromDB.image,
         qty: itemFromClient.quantity,
         color: itemFromClient.color,
         _id: undefined,
      };
   });

   // Calculate prices
   const { itemsPrice, taxPrice, shippingPrice, totalPrice } = calcPrices(dbOrderItems);

   const order = new Order({
      orderItems: dbOrderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice: Number(itemsPrice),
      taxPrice: Number(taxPrice),
      shippingPrice: Number(shippingPrice),
      totalPrice: Number(totalPrice),
   });

   const createdOrder = await order.save();

   res.status(201).json(createdOrder);
});

// @desc Get logged in users orders
// @route GET /api/orders/myorders
// @access Private
export const getMyOrders = asyncHandler(async (req, res) => {
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

   const count = await Order.countDocuments({ user: req.user._id, ...keyword });
   const orders = await Order.find({ user: req.user._id, ...keyword })
      .sort(sortBy)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

   res.status(200).json({ orders, page, pages: Math.ceil(count / pageSize) })
})

// @desc Get order by ID
// @route GET /api/orders/:id
// @access Private
export const getOrderById = asyncHandler(async (req, res) => {
   const order = await Order.findById(req.params.id).populate('user', 'name email')

   if (order) {
      res.status(200).json(order)
   } else {
      res.status(404)
      throw new Error('Order not found')
   }

})

// @desc Update order by paid
// @route PUT /api/orders/:id/pay
// @access Private
export const updateOrderToPaid = asyncHandler(async (req, res) => {
   const order = await Order.findById(req.params.id)

   if (order) {
      order.isPaid = true
      order.paidAt = Date.now()
      order.PaymentResult = {
         id: req.body.id,
         status: req.body.status,
         update_time: req.body.update_time,
         email_address: req.body.email_address,
      }

      const updateOrder = await order.save()

      res.status(200).json(updateOrder)
   } else {
      res.status(404)
      throw new Error('Order not found.')
   }
})

// @desc Update order by deliveres
// @route PUT /api/orders/:id/deliver
// @access Private/Admin
export const updateOrderToDeliveres = asyncHandler(async (req, res) => {
   const order = await Order.findById(req.params.id)

   if (order) {
      order.isDelivered = true
      order.deliveredAt = Date.now()

      const updateOrder = await order.save()

      res.status(200).json(updateOrder)
   } else {
      res.status(404)
      throw new Error('Order not found.')
   }
})

// @desc Get all orders
// @route GET /api/orders
// @access Private/Admin
export const getOrders = asyncHandler(async (req, res) => {
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

   const count = await Order.countDocuments({ ...keyword });
   const orders = await Order.find({ ...keyword })
      .populate('user', 'id name')
      .sort(sortBy)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

   res.json({ orders, page, pages: Math.ceil(count / pageSize) })
})
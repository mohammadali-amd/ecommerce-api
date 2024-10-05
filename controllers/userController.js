import asyncHandler from "../middleWare/asyncHandler.js"
import User from "../models/userModel.js"
import { generateToken } from "../utils/generateToken.js"

// @desc Auth users & get token
// @route POST /api/users/login
// @access Public
export const authUser = asyncHandler(async (req, res) => {
   const { email, password } = req.body

   const user = await User.findOne({ email: email })

   if (user && (await user.matchPassword(password))) {
      generateToken(res, user._id)

      res.status(200).json({
         _id: user._id,
         name: user.name,
         email: user.email,
         isAdmin: user.isAdmin,
      })
   } else {
      res.status(401)
      throw new Error('Invalid email or password')
   }
})

// @desc Register user
// @route POST /api/users
// @access Public
export const registerUser = asyncHandler(async (req, res) => {
   const { name, email, password } = req.body

   const userExists = await User.findOne({ email })

   if (userExists) {
      res.status(400)
      throw new Error('User already exists')
   }

   const user = await User.create({
      name,
      email,
      password
   })

   if (user) {
      generateToken(res, user._id)

      res.status(201).json({
         _id: user._id,
         name: user.name,
         email: user.email,
         isAdmin: user.isAdmin,
      })
   } else {
      res.status(400)
      throw new Error('Invalid user data')
   }
})

// @desc Logout users / clear cookie
// @route POST /api/users/logout
// @access Private
export const logoutUser = asyncHandler(async (req, res) => {
   res.cookie('jwt', '', {
      httpOnly: true,
      expires: new Date(0)
   })

   res.status(200).json({ message: 'Logged out successfully' })
})

// @desc Get user profile
// @route GET /api/users/profile
// @access Private
export const getUserProfile = asyncHandler(async (req, res) => {
   const user = await User.findById(req.user._id)

   if (user) {
      res.status(200).json({
         _id: user._id,
         name: user.name,
         phone: user.phone,
         email: user.email,
         isAdmin: user.isAdmin,
         address: user.address,
         city: user.city,
         postalCode: user.postalCode,
      })
   } else {
      res.status(404)
      throw new Error('User not found')
   }
})

// @desc Update user profile
// @route PUT /api/users/profile
// @access Private
export const updateUserProfile = asyncHandler(async (req, res) => {
   const user = await User.findOne(req.user._id)

   if (user) {
      user.name = req.body.name || user.name
      user.email = req.body.email || user.email
      user.phone = req.body.phone || user.phone
      user.address = req.body.address || user.address.address,
         user.city = req.body.city || user.address.city,
         user.postalCode = req.body.postalCode || user.address.postalCode

      if (req.body.password) {
         user.password = req.body.password
      }

      const updatedUser = await user.save()

      res.status(200).json({
         _id: updatedUser._id,
         name: updatedUser.name,
         email: updatedUser.email,
         phone: updatedUser.phone,
         isAdmin: updatedUser.isAdmin,
         city: updatedUser.city,
         address: updatedUser.address,
         postalCode: updatedUser.postalCode,
      })
   } else {
      throw new Error('User not found')
   }
})

// @desc Get users
// @route GET /api/users
// @access Private/Admin
export const getUsers = asyncHandler(async (req, res) => {
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

   const count = await User.countDocuments({ ...keyword });
   const users = await User.find({ ...keyword })
      .sort(sortBy)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

   res.status(200).json({ users, page, pages: Math.ceil(count / pageSize) })
})

// @desc Get user by ID
// @route GET /api/users/:id
// @access Private/Admin
export const getUserByID = asyncHandler(async (req, res) => {
   const user = await User.findById(req.params.id).select('-password')

   if (user) {
      res.status(200).json(user)
   } else {
      res.status(404)
      throw new Error('User not found')
   }
})

// @desc Delete user
// @route DELETE /api/users/:id
// @access Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
   const user = await User.findById(req.params.id)

   if (user) {
      if (user.isAdmin) {
         res.status(400)
         throw new Error('Cannot delete admin user!')
      }
      await User.deleteOne({ _id: user._id })
      res.status(200).json({ message: 'User deleted successfully' })
   } else {
      res.status(404)
      throw new Error('User not found')
   }
})

// @desc Update user
// @route PUT /api/users/:id
// @access Private/Admin
export const updateUser = asyncHandler(async (req, res) => {
   const user = await User.findById(req.params.id)

   if (user) {
      user.name = req.body.name || user.name
      user.phone = req.body.phone || user.phone
      user.email = req.body.email || user.email
      user.address = req.body.address || user.address.address,
         user.city = req.body.city || user.address.city,
         user.postalCode = req.body.postalCode || user.address.postalCode

      user.isAdmin = Boolean(req.body.isAdmin)

      const updatedUser = await user.save()

      res.status(200).json({
         _id: updatedUser._id,
         name: updatedUser.name,
         phone: updatedUser.phone,
         email: updatedUser.email,
         address: updatedUser.address,
         city: updatedUser.city,
         postalCode: updatedUser.postalCode,
         isAdmin: updatedUser.isAdmin,
      })
   } else {
      res.status(404)
      throw new Error('User not found')
   }
})
import jwt from 'jsonwebtoken'
import asyncHandler from './asyncHandler.js'
import User from '../models/userModel.js'

// Protect routes
export const protect = asyncHandler(async (req, res, next) => {
   // Read the JWT from the 'jwt' cookie
   let token = req.cookies.jwt

   if (token) {
      try {
         const decoded = jwt.verify(token, process.env.JWT_SECRET)
         req.user = await User.findById(decoded.userId).select('-password')
         next()
      } catch (error) {
         console.log('Token verification failed:', error);
         res.status(401)
         throw new Error('Not authorized, token failed.')
      }
   } else {
      console.log('No token found in cookies')
      res.status(401)
      throw new Error('Not authorized, no token.')
   }
})

// Admin middleware
export const admin = (req, res, next) => {
   if (req.user && req.user.isAdmin) {
      next()
   } else {
      res.status(401)
      throw new Error('Not authorized as an admin!')
   }
}
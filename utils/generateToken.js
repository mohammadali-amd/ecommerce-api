import jwt from "jsonwebtoken"

export const generateToken = (res, userId) => {
   const token = jwt.sign({ userId: userId }, process.env.JWT_SECRET, {
      expiresIn: '3d'
   })

   // Set JWT as HTTP-Only cookie
   res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 Days
   })
}
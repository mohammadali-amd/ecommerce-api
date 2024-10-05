import express from 'express'
import { admin, protect } from '../middleWare/authMiddleware.js'
import { authUser, registerUser, logoutUser, getUserProfile, updateUserProfile, getUsers, getUserByID, deleteUser, updateUser } from '../controllers/userController.js'

const router = express.Router()

router.route('/')
   .post(registerUser)
   .get(protect, admin, getUsers)

router.post('/logout', logoutUser)

router.post('/login', authUser)

router.route('/profile')
   .get(protect, getUserProfile)
   .put(protect, updateUserProfile)

router.route('/:id')
   .delete(protect, admin, deleteUser)
   .get(protect, admin, getUserByID)
   .put(protect, admin, updateUser)

export default router
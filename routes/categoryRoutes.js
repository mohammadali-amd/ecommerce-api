import express from 'express';
import { admin, protect } from '../middleWare/authMiddleware.js'
import { createCategory, getCategories, updateCategory, deleteCategory, addSubcategory, updateSubcategory, deleteSubcategory } from '../controllers/categoryController.js';

const router = express.Router();

router.route('/')
   .post(protect, admin, createCategory)
   .get(getCategories);

router.route('/:id')
   .put(protect, admin, updateCategory)
   .delete(protect, admin, deleteCategory);

router.route('/:id/subcategories')
   .post(protect, admin, addSubcategory)

router.route('/:categoryId/subcategories/:subId')
   .put(protect, admin, updateSubcategory)
   .delete(protect, admin, deleteSubcategory);

export default router;
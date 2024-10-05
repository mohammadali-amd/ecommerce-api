import asyncHandler from "../middleWare/asyncHandler.js"
import Category from '../models/categoryModel.js';

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
   const { name, slug } = req.body;

   const categoryExists = await Category.findOne({ name, slug });

   if (categoryExists) {
      res.status(400);
      throw new Error('Category already exists');
   }

   const category = new Category({ name, slug });

   const createdCategory = await category.save();
   res.status(201).json(createdCategory);
});

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
   const categories = await Category.find({});
   res.json(categories);
});

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
   const category = await Category.findById(req.params.id);

   if (category) {
      category.name = req.body.name || category.name;
      category.slug = req.body.slug || category.slug;

      const updatedCategory = await category.save();
      res.json(updatedCategory);
   } else {
      res.status(404);
      throw new Error('Category not found');
   }
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
   const categoryId = req.params.id;

   // Validate the category ID
   if (!categoryId) {
      res.status(400);
      throw new Error('Category ID is required');
   }

   // Find and delete the category
   const category = await Category.findByIdAndDelete(categoryId);

   if (category) {
      res.json({ message: 'Category removed' });
   } else {
      res.status(404);
      throw new Error('Category not found');
   }
});

// @desc    Add a subcategory to a category
// @route   POST /api/categories/:id/subcategories
// @access  Private/Admin
const addSubcategory = asyncHandler(async (req, res) => {
   const category = await Category.findById(req.params.id);

   if (category) {
      const newSubcategory = {
         name: req.body.name,
         slug: req.body.slug,
      };

      category.subcategories.push(newSubcategory);
      await category.save();

      res.status(201).json(newSubcategory);
   } else {
      res.status(404);
      throw new Error('Category not found');
   }
});

// @desc    Update a subcategory
// @route   PUT /api/categories/:categoryId/subcategories/:subId
// @access  Private/Admin
const updateSubcategory = asyncHandler(async (req, res) => {
   const category = await Category.findById(req.params.categoryId);

   if (category) {
      const subcategory = category.subcategories.id(req.params.subId);
      if (subcategory) {
         subcategory.name = req.body.name || subcategory.name;
         subcategory.slug = req.body.slug || subcategory.slug;
         await category.save();
         res.json({ message: 'Subcategory updated successfully', subcategory });
      } else {
         res.status(404);
         throw new Error('Subcategory not found');
      }
   } else {
      res.status(404);
      throw new Error('Category not found');
   }
});

// @desc    Delete a subcategory
// @route   DELETE /api/categories/:categoryId/subcategories/:subId
// @access  Private/Admin
const deleteSubcategory = asyncHandler(async (req, res) => {
   try {
      const category = await Category.findById(req.params.categoryId);

      if (category) {
         const subcategory = category.subcategories.id(req.params.subId);

         if (subcategory) {
            category.subcategories = category.subcategories.filter(sub => sub._id.toString() !== req.params.subId);
            await category.save();
            res.json({ message: 'Subcategory removed' });
         } else {
            res.status(404);
            throw new Error('Subcategory not found');
         }
      } else {
         res.status(404);
         throw new Error('Category not found');
      }
   } catch (error) {
      console.error("Error deleting subcategory:", error);
      res.status(500).json({ message: "Server Error", error: error.message });
   }
});

export { createCategory, getCategories, updateCategory, deleteCategory, addSubcategory, updateSubcategory, deleteSubcategory };

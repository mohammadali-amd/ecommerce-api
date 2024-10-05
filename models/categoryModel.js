import mongoose from 'mongoose';

const subcategorySchema = mongoose.Schema({
   name: {
      type: String,
      required: true,
   },
   slug: {
      type: String,
      required: true,
      unique: true,
   },
});

const categorySchema = mongoose.Schema({
   name: {
      type: String,
      required: true,
   },
   slug: {
      type: String,
      required: true,
      unique: true,
   },
   subcategories: [subcategorySchema],
});

const Category = mongoose.model('Category', categorySchema);

export default Category;

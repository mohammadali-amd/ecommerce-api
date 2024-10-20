import mongoose from 'mongoose'

const reviewSchema = mongoose.Schema(
   {
      name: { type: String, required: true },
      rating: { type: Number, required: true },
      comment: { type: String, required: true },
      user: {
         type: mongoose.Schema.Types.ObjectId,
         required: true,
         ref: 'User',
      },
   },
   {
      timestamps: true,
   }
);

const colorSchema = mongoose.Schema({
   name: { type: String, required: true },
   code: { type: String, required: true },
   quantity: { type: Number, required: true, default: 0 }
});

const featureSchema = mongoose.Schema({
   title: { type: String, required: true },
   value: { type: String, required: true },
   mainFeature: { type: Boolean, required: true, default: false }
});

const productSchema = mongoose.Schema(
   {
      user: {
         type: mongoose.Schema.Types.ObjectId,
         required: true,
         ref: 'User',
      },
      name: {
         type: String,
         required: true,
      },
      image: {
         type: String,
         required: true
      },
      additionalImages: [
         {
            type: String,
            required: false,
         }
      ],
      brand: {
         type: String,
         required: true,
      },
      category: {
         name: {
            type: String,
            required: true,
         },
         slug: {
            type: String,
            required: true,
         }
      },
      subcategory: {
         name: { type: String },
         slug: { type: String }
      },
      colors: [colorSchema],
      features: [featureSchema],
      description: {
         type: String,
         required: true,
      },
      reviews: [reviewSchema],
      rating: {
         type: Number,
         required: true,
         default: 0,
      },
      numReviews: {
         type: Number,
         required: true,
         default: 0,
      },
      price: {
         type: Number,
         required: true,
         default: 0,
      },
      priceWithOff: {
         type: Number,
         required: false,
         default: 0,
      },
      discount: {
         type: Number,
         required: false,
         default: 0,
      },
      isAmazingOffer: {
         type: Boolean,
         required: true,
         default: false,
      },
      countInStock: {
         type: Number,
         required: true,
         default: 0,
      },
   },
   {
      timestamps: true,
   }
);

const Product = mongoose.model('Product', productSchema);

export default Product

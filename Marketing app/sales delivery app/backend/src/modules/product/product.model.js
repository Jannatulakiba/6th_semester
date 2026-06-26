import mongoose from 'mongoose';
import { RATING } from '../../shared/constants/index.js';

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  text: {
    type: String,
    required: true,
    maxlength: 500,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ratingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  value: {
    type: Number,
    required: true,
    min: RATING.MIN,
    max: RATING.MAX,
  },
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: Array, required: true },
  cloudinaryIds: { type: [String], default: [] },
  category: { type: String, required: true },
  subCategory: { type: String, required: true },
  sizes: { type: Array, required: true },
  bestseller: { type: Boolean },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    default: null,
  },
  ratings: [ratingSchema],
  averageRating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  comments: [commentSchema],
  date: { type: Number, required: true }
}, { timestamps: true });

productSchema.methods.calculateAverageRating = function () {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
    this.totalRatings = 0;
    return;
  }

  const sum = this.ratings.reduce((acc, r) => acc + r.value, 0);
  this.averageRating = Math.round((sum / this.ratings.length) * 10) / 10;
  this.totalRatings = this.ratings.length;
};

const productModel = mongoose.models.product || mongoose.model('product', productSchema);

export default productModel;

import productRepository from './product.repository.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../../shared/utils/cloudinaryHelper.js';
import { CLOUDINARY_FOLDERS, RATING } from '../../shared/constants/index.js';
import ApiError from '../../shared/errors/ApiError.js';

class ProductService {
  async addProduct({ name, description, price, category, subCategory, sizes, bestseller, files, userId }) {
    const images = [files?.image1?.[0], files?.image2?.[0], files?.image3?.[0], files?.image4?.[0]]
      .filter(Boolean);

    if (images.length === 0) {
      throw ApiError.badRequest('At least one product image is required');
    }

    const uploadResults = await Promise.all(
      images.map((file) => uploadToCloudinary(file.buffer, CLOUDINARY_FOLDERS.PRODUCTS))
    );

    const imagesUrl = uploadResults.map((r) => r.secure_url);
    const cloudinaryIds = uploadResults.map((r) => r.public_id);

    const product = await productRepository.create({
      name,
      description,
      price: Number(price),
      category,
      subCategory,
      sizes: typeof sizes === 'string' ? JSON.parse(sizes) : sizes,
      bestseller: bestseller === 'true' || bestseller === true,
      image: imagesUrl,
      cloudinaryIds,
      createdBy: userId || null,
      date: Date.now()
    });

    return product;
  }

  async listProducts({ page = 1, limit = 10, category, subCategory, search, minPrice, maxPrice, sort } = {}) {
    const query = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    if (category) query.category = { $in: category.split(',') };
    if (subCategory) query.subCategory = { $in: subCategory.split(',') };
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined && maxPrice !== 'Infinity') query.price.$lte = Number(maxPrice);
    }

    let sortObj = { date: -1 };
    if (sort === 'low-high') sortObj = { price: 1 };
    if (sort === 'high-low') sortObj = { price: -1 };

    if (Number(limit) === 0) {
      const products = await productRepository.findWithPagination(query, 0, 0, sortObj);
      return { products, page: 1, limit: 0, total: products.length, totalPages: 1 };
    }

    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      productRepository.findWithPagination(query, skip, limit, sortObj),
      productRepository.count(query),
    ]);

    return { products, page, limit, total, totalPages: Math.ceil(total / limit) };
  }

  async removeProduct(id) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    if (product.cloudinaryIds && product.cloudinaryIds.length > 0) {
      const deletePromises = product.cloudinaryIds.map((cid) => deleteFromCloudinary(cid));
      await Promise.all(deletePromises);
    }

    await productRepository.findByIdAndDelete(id);
  }

  async getSingleProduct(productId) {
    const product = await productRepository.findByIdWithCommentsAndRatings(productId);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }
    return { product };
  }

  async updateProduct(id, updateData, files) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    const images = files
      ? [files.image1?.[0], files.image2?.[0], files.image3?.[0], files.image4?.[0]].filter(Boolean)
      : [];

    if (images.length > 0) {
      if (product.cloudinaryIds && product.cloudinaryIds.length > 0) {
        await Promise.all(product.cloudinaryIds.map((cid) => deleteFromCloudinary(cid)));
      }

      const uploadResults = await Promise.all(
        images.map((file) => uploadToCloudinary(file.buffer, CLOUDINARY_FOLDERS.PRODUCTS))
      );

      product.image = uploadResults.map((r) => r.secure_url);
      product.cloudinaryIds = uploadResults.map((r) => r.public_id);
    }

    if (updateData.name) product.name = updateData.name;
    if (updateData.description) product.description = updateData.description;
    if (updateData.price) product.price = Number(updateData.price);
    if (updateData.category) product.category = updateData.category;
    if (updateData.subCategory) product.subCategory = updateData.subCategory;
    if (updateData.sizes) product.sizes = typeof updateData.sizes === 'string' ? JSON.parse(updateData.sizes) : updateData.sizes;
    if (updateData.bestseller !== undefined) product.bestseller = updateData.bestseller === 'true' || updateData.bestseller === true;

    await product.save();
    return product;
  }

  async rateProduct(productId, userId, value) {
    if (!value || value < RATING.MIN || value > RATING.MAX) {
      throw ApiError.badRequest(`Rating must be between ${RATING.MIN} and ${RATING.MAX}`);
    }

    const product = await productRepository.findById(productId);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    const existingRating = product.ratings.find((r) => r.user.toString() === userId);

    if (existingRating) {
      existingRating.value = value;
    } else {
      product.ratings.push({ user: userId, value });
    }

    product.calculateAverageRating();
    await product.save();

    return {
      averageRating: product.averageRating,
      totalRatings: product.totalRatings,
    };
  }

  async addComment(productId, userId, text) {
    if (!text || text.trim() === '') {
      throw ApiError.badRequest('Comment text is required');
    }

    const product = await productRepository.findById(productId);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    product.comments.push({ user: userId, text: text.trim() });
    await product.save();

    const updatedProduct = await productRepository.findByIdWithCommentsAndRatings(productId);
    return updatedProduct.comments[updatedProduct.comments.length - 1];
  }

  async removeComment(productId, commentId, userId) {
    const product = await productRepository.findById(productId);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    const comment = product.comments.id(commentId);
    if (!comment) {
      throw ApiError.notFound('Comment not found');
    }

    const isCommentOwner = comment.user.toString() === userId;
    const isProductOwner = product.createdBy && product.createdBy.toString() === userId;

    if (!isCommentOwner && !isProductOwner) {
      throw ApiError.forbidden('Not authorized to delete this comment');
    }

    product.comments.pull(commentId);
    await product.save();
  }
}

export default new ProductService();

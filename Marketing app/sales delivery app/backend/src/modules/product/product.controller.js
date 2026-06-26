import ApiResponse from '../../shared/utils/ApiResponse.js';
import productService from './product.service.js';

export const addProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, subCategory, sizes, bestseller } = req.body;
    const userId = req.user?.id || null;

    const product = await productService.addProduct({
      name,
      description,
      price,
      category,
      subCategory,
      sizes,
      bestseller,
      files: req.files,
      userId
    });

    ApiResponse.created({ product }, 'Product added successfully').send(res);
  } catch (error) {
    next(error);
  }
};

export const listProducts = async (req, res, next) => {
  try {
    const { page, limit, category, subCategory, search, minPrice, maxPrice, sort } = req.query;
    
    const result = await productService.listProducts({
      page: page ? Number(page) : undefined,
      limit: limit !== undefined ? Number(limit) : undefined,
      category,
      subCategory,
      search,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sort
    });

    ApiResponse.ok(result, 'Products fetched successfully').send(res);
  } catch (error) {
    next(error);
  }
};

export const removeProduct = async (req, res, next) => {
  try {
    const { id } = req.body;
    await productService.removeProduct(id);
    ApiResponse.ok(null, 'Product removed successfully').send(res);
  } catch (error) {
    next(error);
  }
};

export const singleProduct = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const result = await productService.getSingleProduct(productId);
    ApiResponse.ok(result, 'Product details fetched').send(res);
  } catch (error) {
    next(error);
  }
};

export const editProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await productService.updateProduct(id, req.body, req.files);
    ApiResponse.ok({ product }, 'Product updated successfully').send(res);
  } catch (error) {
    next(error);
  }
};

export const rateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    const result = await productService.rateProduct(id, req.user.id, Number(rating));
    ApiResponse.ok(result, 'Product rated successfully').send(res);
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const comment = await productService.addComment(id, req.user.id, text);
    ApiResponse.created({ comment }, 'Comment added successfully').send(res);
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const { id, commentId } = req.params;
    await productService.removeComment(id, commentId, req.user.id);
    ApiResponse.ok(null, 'Comment deleted successfully').send(res);
  } catch (error) {
    next(error);
  }
};

export default {
  addProduct,
  listProducts,
  removeProduct,
  singleProduct,
  editProduct,
  rateProduct,
  addComment,
  deleteComment,
};

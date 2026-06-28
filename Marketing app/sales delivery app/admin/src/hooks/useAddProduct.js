/**
 * Custom hook for the Add Product form.
 * Manages form state, image uploads, and submission logic.
 */
import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { MAX_PRODUCT_IMAGES } from '../config/constants';
import { useAddProductMutation } from '../redux/api/productApiSlice';

const INITIAL_FORM_STATE = {
  name: '',
  description: '',
  price: '',
  category: 'Men',
  subCategory: 'Topwear',
  bestseller: false,
  sizes: [],
};

const useAddProduct = () => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [images, setImages] = useState(Array(MAX_PRODUCT_IMAGES).fill(null));
  const [addProductMut, { isLoading: isSubmitting }] = useAddProductMutation();

  /** Update a single form field. */
  const updateField = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  /** Toggle a size in the sizes array. */
  const toggleSize = useCallback((size) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  }, []);

  /** Toggle the bestseller flag. */
  const toggleBestseller = useCallback(() => {
    setFormData((prev) => ({ ...prev, bestseller: !prev.bestseller }));
  }, []);

  /** Set an image at a specific index (0-based). */
  const setImage = useCallback((index, file) => {
    setImages((prev) => {
      const next = [...prev];
      next[index] = file;
      return next;
    });
  }, []);

  /** Reset the entire form to initial values. */
  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_STATE);
    setImages(Array(MAX_PRODUCT_IMAGES).fill(null));
  }, []);

  const submitProduct = useCallback(async () => {
    try {
      const payload = new FormData();

      // Append text fields
      Object.entries(formData).forEach(([key, value]) => {
        payload.append(key, key === 'sizes' ? JSON.stringify(value) : value);
      });

      // Append images
      images.forEach((file, index) => {
        if (file) {
          payload.append(`image${index + 1}`, file);
        }
      });

      const data = await addProductMut(payload).unwrap();

      if (data.success) {
        toast.success(data.message || 'Product added successfully');
        resetForm();
      } else {
        toast.error(data.message || 'Failed to add product');
      }
    } catch (error) {
      toast.error(error?.data?.message || error.message || 'Failed to add product');
    }
  }, [formData, images, resetForm, addProductMut]);

  return {
    formData,
    images,
    isSubmitting,
    updateField,
    toggleSize,
    toggleBestseller,
    setImage,
    submitProduct,
  };
};

export default useAddProduct;

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';
import {
  PRODUCT_CATEGORIES,
  PRODUCT_SUB_CATEGORIES,
  PRODUCT_SIZES,
  MAX_PRODUCT_IMAGES,
} from '../config/constants';
import { useAddProductMutation } from '../redux/api/productApiSlice';

// --- Zod Schema ---
const addProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number({ invalid_type_error: 'Price must be a number' }).positive('Price must be a positive number')
  ),
  category: z.string().min(1, 'Category is required'),
  subCategory: z.string().min(1, 'Subcategory is required'),
  bestseller: z.boolean().default(false),
  sizes: z.array(z.string()).default([]),
});

// ── Sub-components ─────────────────────────────────────────────────────────────

/** Renders the image upload grid. */
const ImageUploadGrid = ({ images, onImageChange }) => (
  <div>
    <p className="mb-2 font-medium text-gray-700">Upload Images</p>
    <div className="flex gap-2">
      {Array.from({ length: MAX_PRODUCT_IMAGES }, (_, index) => (
        <label key={index} htmlFor={`image-${index}`} className="cursor-pointer">
          <img
            className="w-20 h-20 object-cover border border-gray-300 rounded hover:border-gray-800 transition-colors"
            src={
              images[index]
                ? URL.createObjectURL(images[index])
                : assets.upload_area
            }
            alt={`Upload slot ${index + 1}`}
          />
          <input
            onChange={(e) => onImageChange(index, e.target.files[0])}
            type="file"
            id={`image-${index}`}
            hidden
            accept="image/*"
          />
        </label>
      ))}
    </div>
  </div>
);

/** Renders the size selection chips. */
const SizeSelector = ({ sizes, selectedSizes, onToggle }) => (
  <div>
    <p className="mb-2 font-medium text-gray-700">Product Sizes</p>
    <div className="flex gap-3">
      {sizes.map((size) => {
        const isSelected = selectedSizes.includes(size);
        return (
          <p
            key={size}
            onClick={() => onToggle(size)}
            className={`px-3 py-1 cursor-pointer border rounded font-medium select-none transition-colors ${
              isSelected
                ? 'bg-pink-100 border-pink-500 text-pink-700'
                : 'bg-gray-100 border-gray-300 text-gray-600 hover:border-gray-500'
            }`}
          >
            {size}
          </p>
        );
      })}
    </div>
  </div>
);

// ── Main component ─────────────────────────────────────────────────────────────

const Add = () => {
  const [images, setImages] = useState(Array(MAX_PRODUCT_IMAGES).fill(null));
  const [addProductMut, { isLoading: isSubmitting }] = useAddProductMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addProductSchema),
    defaultValues: {
      name: '',
      description: '',
      price: '',
      category: PRODUCT_CATEGORIES[0] || 'Men',
      subCategory: PRODUCT_SUB_CATEGORIES[0] || 'Topwear',
      bestseller: false,
      sizes: [],
    },
  });

  const selectedSizes = watch('sizes') || [];

  const handleImageChange = useCallback((index, file) => {
    if (file && !file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }
    setImages((prev) => {
      const next = [...prev];
      next[index] = file;
      return next;
    });
  }, []);

  const toggleSize = useCallback((size) => {
    const nextSizes = selectedSizes.includes(size)
      ? selectedSizes.filter((s) => s !== size)
      : [...selectedSizes, size];
    setValue('sizes', nextSizes, { shouldValidate: true });
  }, [selectedSizes, setValue]);

  const onSubmit = async (values) => {
    const hasImage = images.some((img) => img !== null);
    if (!hasImage) {
      toast.error('Please upload at least one image');
      return;
    }

    try {
      const payload = new FormData();

      // Append text fields
      Object.entries(values).forEach(([key, value]) => {
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
        reset();
        setImages(Array(MAX_PRODUCT_IMAGES).fill(null));
      } else {
        toast.error(data.message || 'Failed to add product');
      }
    } catch (error) {
      toast.error(error?.data?.message || error.message || 'Failed to add product');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col w-full items-start gap-4 p-4 max-w-2xl bg-white rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Add New Product</h2>

      <ImageUploadGrid images={images} onImageChange={handleImageChange} />

      {/* Product Name */}
      <div className="w-full">
        <p className="mb-2 font-medium text-gray-700">Product Name</p>
        <input
          {...register('name')}
          className={`w-full max-w-[500px] px-3 py-2 border rounded outline-none focus:ring-1 focus:ring-gray-900 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          type="text"
          placeholder="Type here"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>

      {/* Product Description */}
      <div className="w-full">
        <p className="mb-2 font-medium text-gray-700">Product Description</p>
        <textarea
          {...register('description')}
          className={`w-full max-w-[500px] px-3 py-2 border rounded outline-none focus:ring-1 focus:ring-gray-900 h-24 ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Write content here"
        />
        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
      </div>

      {/* Category / Sub-category / Price */}
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <div>
          <p className="mb-2 font-medium text-gray-700">Product Category</p>
          <select
            {...register('category')}
            className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-gray-900"
          >
            {PRODUCT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <p className="mb-2 font-medium text-gray-700">Sub Category</p>
          <select
            {...register('subCategory')}
            className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-gray-900"
          >
            {PRODUCT_SUB_CATEGORIES.map((sub) => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>

        <div>
          <p className="mb-2 font-medium text-gray-700">Product Price</p>
          <input
            {...register('price')}
            className={`w-full px-3 py-2 border rounded sm:w-[120px] outline-none focus:ring-1 focus:ring-gray-900 ${
              errors.price ? 'border-red-500' : 'border-gray-300'
            }`}
            type="text"
            placeholder="25"
          />
          {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
        </div>
      </div>

      {/* Sizes */}
      <div>
        <SizeSelector
          sizes={PRODUCT_SIZES}
          selectedSizes={selectedSizes}
          onToggle={toggleSize}
        />
        {errors.sizes && <p className="text-red-500 text-xs mt-1">{errors.sizes.message}</p>}
      </div>

      {/* Bestseller */}
      <div className="flex items-center gap-2 mt-2">
        <input
          {...register('bestseller')}
          type="checkbox"
          id="bestseller"
          className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
        />
        <label className="cursor-pointer font-medium text-gray-700 select-none" htmlFor="bestseller">
          Add to bestseller
        </label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-28 py-3 mt-4 bg-black text-white rounded font-medium shadow-md hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        {isSubmitting ? 'Adding…' : 'ADD'}
      </button>
    </form>
  );
};

export default Add;
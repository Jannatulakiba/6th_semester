import { useMemo, useState, useCallback } from 'react';
import { useParams } from 'react-router';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets.js';
import useShop from '../hooks/useShop.js';
import RelatedProducts from '../components/relatedProducts.jsx';
import { useRateProductMutation, useAddCommentMutation, useDeleteCommentMutation } from '../redux/api/productApiSlice.js';

// ── Star Rating Component ────────────────────────────────────────────
const StarRating = ({ rating = 0, interactive = false, onRate, size = 'w-4' }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className='flex items-center gap-0.5'>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = interactive ? star <= (hover || rating) : star <= Math.round(rating);
        return (
          <svg
            key={star}
            onClick={() => interactive && onRate?.(star)}
            onMouseEnter={() => interactive && setHover(star)}
            onMouseLeave={() => interactive && setHover(0)}
            className={`${size} ${interactive ? 'cursor-pointer' : ''} transition-colors`}
            fill={filled ? '#f59e0b' : '#d1d5db'}
            viewBox='0 0 20 20'
          >
            <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
          </svg>
        );
      })}
    </div>
  );
};

// ── Comment Component ────────────────────────────────────────────────
const Comment = ({ comment, currentUserId, onDelete }) => {
  const date = new Date(comment.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  return (
    <div className='border-b pb-4 mb-4 last:border-0'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <div className='w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center text-sm font-medium'>
            {comment.user?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <p className='font-medium text-sm'>{comment.user?.name || 'User'}</p>
            <p className='text-xs text-gray-400'>{date}</p>
          </div>
        </div>
        {currentUserId === comment.user?._id && (
          <button
            onClick={() => onDelete(comment._id)}
            className='text-xs text-red-400 hover:text-red-600 transition-colors'
          >
            Delete
          </button>
        )}
      </div>
      <p className='mt-2 text-sm text-gray-600 pl-10'>{comment.text}</p>
    </div>
  );
};

// ── Main Product Page ────────────────────────────────────────────────
const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart, token } = useShop();
  const [image, setImage] = useState('');
  const [size, setSize] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  const [commentText, setCommentText] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [localProduct, setLocalProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [rateProduct] = useRateProductMutation();
  const [addComment] = useAddCommentMutation();
  const [deleteCommentMut] = useDeleteCommentMutation();

  // Get current user ID from token
  const currentUserId = useMemo(() => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch { return null; }
  }, [token]);

  // Derive product data
  const productData = useMemo(() => {
    const found = products.find((item) => item._id === productId);
    if (found && !image) setImage(found.image[0]);
    if (found && !localProduct) setLocalProduct(found);
    return found || null;
  }, [products, productId]);

  // Use localProduct for dynamic data (ratings/comments update)
  const displayProduct = localProduct || productData;

  // ── Rate Product ─────────────────────
  const handleRate = useCallback(async (value) => {
    if (!token) return toast.error('Please login to rate');
    setSubmitting(true);
    try {
      const res = await rateProduct({ productId, value }).unwrap();
      if (res.success) {
        setUserRating(value);
        setLocalProduct(prev => ({
          ...prev,
          averageRating: res.averageRating,
          totalRatings: res.totalRatings,
        }));
        toast.success('Rating submitted!');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }, [productId, token]);

  // ── Add Comment ─────────────────────
  const handleAddComment = useCallback(async () => {
    if (!token) return toast.error('Please login to comment');
    if (!commentText.trim()) return toast.error('Please write a comment');
    setSubmitting(true);
    try {
      const res = await addComment({ productId, text: commentText.trim() }).unwrap();
      if (res.success) {
        setLocalProduct(prev => ({
          ...prev,
          comments: [...(prev.comments || []), res.comment],
        }));
        setCommentText('');
        toast.success('Comment added!');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }, [productId, commentText, token]);

  // ── Delete Comment ─────────────────────
  const handleDeleteComment = useCallback(async (commentId) => {
    try {
      const res = await deleteCommentMut({ productId, commentId }).unwrap();
      if (res.success) {
        setLocalProduct(prev => ({
          ...prev,
          comments: prev.comments.filter(c => c._id !== commentId),
        }));
        toast.success('Comment deleted');
      }
    } catch (err) {
      toast.error(err.message);
    }
  }, [productId]);

  if (!displayProduct) {
    return (
      <div className='min-h-[60vh] flex items-center justify-center'>
        <div className='w-12 h-12 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin' />
      </div>
    );
  }

  const comments = displayProduct.comments || [];

  return (
    <div className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100'>
      {/* Product Data */}
      <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>
        {/* Product Images */}
        <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
          <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full'>
            {displayProduct.image.map((item, index) => (
              <img
                onClick={() => setImage(item)}
                src={item}
                key={index}
                className={`w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer border-2 transition-colors ${
                  image === item ? 'border-gray-800' : 'border-transparent'
                }`}
                alt={`${displayProduct.name} view ${index + 1}`}
              />
            ))}
          </div>
          <div className='w-full sm:w-[80%]'>
            <img className='w-full h-auto' src={image} alt={displayProduct.name} />
          </div>
        </div>

        {/* Product Info */}
        <div className='flex-1'>
          <h1 className='font-medium text-2xl mt-2'>{displayProduct.name}</h1>

          {/* Real Rating Display */}
          <div className='flex items-center gap-2 mt-2'>
            <StarRating rating={displayProduct.averageRating || 0} />
            <p className='text-sm text-gray-500'>
              ({displayProduct.totalRatings || 0} {displayProduct.totalRatings === 1 ? 'review' : 'reviews'})
            </p>
          </div>

          <p className='mt-5 text-3xl font-medium'>
            {currency}{displayProduct.price}
          </p>
          <p className='mt-5 text-gray-500 md:w-4/5'>{displayProduct.description}</p>

          {/* Size Selection */}
          <div className='flex flex-col gap-4 my-8'>
            <p>Select Size</p>
            <div className='flex gap-2'>
              {displayProduct.sizes.map((item) => (
                <button
                  onClick={() => setSize(item)}
                  className={`border py-2 px-4 bg-gray-100 transition-colors ${
                    item === size ? 'border-orange-500 bg-orange-50' : 'hover:border-gray-400'
                  }`}
                  key={item}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => addToCart(displayProduct._id, size)}
            className='bg-black text-white px-8 py-3 text-sm active:bg-gray-700 hover:bg-gray-800 transition-colors'
          >
            ADD TO CART
          </button>

          {/* Rate This Product */}
          {token && (
            <div className='mt-6 p-4 bg-gray-50 rounded-lg'>
              <p className='text-sm font-medium mb-2'>Rate this product</p>
              <StarRating rating={userRating} interactive onRate={handleRate} size='w-6' />
              {submitting && <p className='text-xs text-gray-400 mt-1'>Submitting...</p>}
            </div>
          )}

          <hr className='mt-8 sm:w-4/5' />
          <div className='text-sm text-gray-500 mt-5 flex flex-col gap-1'>
            <p>100% Original product.</p>
            <p>Cash on delivery is available on this product.</p>
            <p>Easy return and exchange policy within 7 days.</p>
          </div>
        </div>
      </div>

      {/* Description & Reviews Section */}
      <div className='mt-20'>
        <div className='flex'>
          <button
            onClick={() => setActiveTab('description')}
            className={`border px-5 py-3 text-sm font-medium transition-colors ${
              activeTab === 'description' ? 'bg-gray-800 text-white' : 'hover:bg-gray-50'
            }`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`border px-5 py-3 text-sm font-medium transition-colors ${
              activeTab === 'reviews' ? 'bg-gray-800 text-white' : 'hover:bg-gray-50'
            }`}
          >
            Reviews ({comments.length})
          </button>
        </div>

        <div className='border px-6 py-6'>
          {activeTab === 'description' ? (
            <div className='flex flex-col gap-4 text-sm text-gray-500'>
              <p>{displayProduct.description}</p>
            </div>
          ) : (
            <div>
              {/* Add Comment Form */}
              {token && (
                <div className='mb-6 flex gap-2'>
                  <input
                    type='text'
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder='Write a comment...'
                    className='flex-1 border px-4 py-2 text-sm rounded-lg focus:outline-none focus:border-gray-800 transition-colors'
                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={submitting}
                    className='bg-black text-white px-6 py-2 text-sm rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors'
                  >
                    Post
                  </button>
                </div>
              )}

              {/* Comments List */}
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <Comment
                    key={comment._id}
                    comment={comment}
                    currentUserId={currentUserId}
                    onDelete={handleDeleteComment}
                  />
                ))
              ) : (
                <p className='text-sm text-gray-400 text-center py-4'>No reviews yet. Be the first to review!</p>
              )}
            </div>
          )}
        </div>
      </div>

      <RelatedProducts category={displayProduct.category} subCategory={displayProduct.subCategory} />
    </div>
  );
};

export default Product;
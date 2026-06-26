/**
 * Product list page.
 * Displays all products in a table with the ability to remove items.
 */
import { toast } from 'react-toastify';
import { useGetProductsQuery, useRemoveProductMutation } from '../redux/api/productApiSlice';

// ── Table header ───────────────────────────────────────────────────────────────
const TABLE_COLUMNS = ['Image', 'Name', 'Category', 'Price', 'Action'];

const TableHeader = () => (
  <div className='hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm'>
    {TABLE_COLUMNS.map((col) => (
      <b key={col} className={col === 'Action' ? 'text-center' : ''}>
        {col}
      </b>
    ))}
  </div>
);

// ── Product row ────────────────────────────────────────────────────────────────
const ProductRow = ({ item, onRemove }) => (
  <div className='grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm'>
    <img src={item.image[0]} alt={item.name} className='w-12' />
    <p>{item.name}</p>
    <p>{item.category}</p>
    <p>${item.price}</p>
    <p
      onClick={() => onRemove(item._id)}
      className='text-right md:text-center cursor-pointer text-lg text-red-500'
    >
      X
    </p>
  </div>
);

// ── Main component ─────────────────────────────────────────────────────────────
const List = () => {
  const { data: products = [], isLoading } = useGetProductsQuery();
  const [removeProduct] = useRemoveProductMutation();

  const handleRemove = async (id) => {
    try {
      const res = await removeProduct(id).unwrap();
      if (res.success) toast.success(res.message || 'Product removed');
      else toast.error(res.message || 'Error removing product');
    } catch (err) {
      toast.error(err?.data?.message || err.message || 'Failed to remove product');
    }
  };

  if (isLoading) {
    return <p className='text-gray-500'>Loading products…</p>;
  }

  return (
    <>
      <p className='mb-2'>All Products List</p>
      <div className='flex flex-col gap-2'>
        <TableHeader />

        {products.length === 0 ? (
          <p className='text-center py-8 text-gray-400'>No products found.</p>
        ) : (
          products.map((item) => (
            <ProductRow key={item._id} item={item} onRemove={handleRemove} />
          ))
        )}
      </div>
    </>
  );
};

export default List;
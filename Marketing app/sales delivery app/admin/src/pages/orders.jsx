/**
 * Orders page.
 * Displays all orders with their details and allows status updates.
 */
import { assets } from '../assets/assets';
import { toast } from 'react-toastify';
import { ORDER_STATUSES } from '../config/constants';
import { useGetAllOrdersQuery, useUpdateOrderStatusMutation } from '../redux/api/orderApiSlice';

// ── Sub-components ─────────────────────────────────────────────────────────────

/** Renders the list of items within an order. */
const OrderItemList = ({ items }) => (
  <div>
    {items.map((item, index) => (
      <p key={index} className='py-0.5'>
        {item.name} x {item.quantity} <span>{item.size}</span>
        {index !== items.length - 1 ? ',' : ''}
      </p>
    ))}
  </div>
);

/** Renders the shipping address block. */
const AddressBlock = ({ address }) => (
  <>
    <p className='mt-3 mb-2 font-medium'>
      {address.firstName} {address.lastName}
    </p>
    <div>
      <p>{address.street},</p>
      <p>
        {address.city}, {address.state}, {address.country}, {address.zipcode}
      </p>
    </div>
    <p>{address.phone}</p>
  </>
);

/** Renders the order metadata (item count, payment method, etc.). */
const OrderMeta = ({ order }) => (
  <div>
    <p className='text-sm sm:text-[15px]'>Items: {order.items.length}</p>
    <p className='mt-3'>Method: {order.paymentMethod}</p>
    <p>Payment: {order.payment ? 'Done' : 'Pending'}</p>
    <p>Date: {new Date(order.date).toLocaleDateString()}</p>
  </div>
);

/** Renders the order status dropdown. */
const StatusSelect = ({ currentStatus, onChange }) => (
  <select
    onChange={onChange}
    value={currentStatus}
    className='p-2 font-semibold'
  >
    {ORDER_STATUSES.map((status) => (
      <option key={status} value={status}>
        {status}
      </option>
    ))}
  </select>
);

// ── Order card ─────────────────────────────────────────────────────────────────

const OrderCard = ({ order, onStatusChange }) => (
  <div className='grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700'>
    <img src={assets.parcel_icon} alt='Parcel' className='w-12' />

    <div>
      <OrderItemList items={order.items} />
      <AddressBlock address={order.address} />
    </div>

    <OrderMeta order={order} />

    <p className='text-sm sm:text-[15px]'>${order.amount}</p>

    <StatusSelect
      currentStatus={order.status}
      onChange={(e) => onStatusChange(order._id, e.target.value)}
    />
  </div>
);

// ── Main component ─────────────────────────────────────────────────────────────

const Orders = () => {
  const { data: orders = [], isLoading } = useGetAllOrdersQuery();
  const [updateStatus] = useUpdateOrderStatusMutation();

  const handleStatusChange = async (orderId, status) => {
    try {
      const res = await updateStatus({ orderId, status }).unwrap();
      if (res.success) toast.success('Status updated');
      else toast.error(res.message || 'Error updating status');
    } catch (err) {
      toast.error(err?.data?.message || err.message || 'Failed to update status');
    }
  };

  if (isLoading) {
    return <p className='text-gray-500'>Loading orders…</p>;
  }

  return (
    <div>
      <h3>Order Page</h3>
      <div>
        {orders.length === 0 ? (
          <p className='text-center py-8 text-gray-400'>No orders found.</p>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onStatusChange={handleStatusChange}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;
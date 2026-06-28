import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';

import { setSearch as setSearchAction, setShowSearch as setShowSearchAction } from '../redux/slices/uiSlice';
import { addLocalCartItem, updateLocalCartQuantity, clearLocalCart, setCartItems as setLocalCartItems } from '../redux/slices/cartSlice';
import { logout as logoutAction, setCredentials } from '../redux/slices/authSlice';

import { useGetAllProductsQuery } from '../redux/api/productApiSlice';
import { useAddToCartMutation, useUpdateCartQuantityMutation, useGetCartQuery } from '../redux/api/cartApiSlice';
import { useGetProfileQuery } from '../redux/api/userApiSlice';

const useShop = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux State
  const { search, showSearch, currency, delivery_fee } = useSelector((state) => state.ui);
  const { cartItems } = useSelector((state) => state.cart);
  const { token, user } = useSelector((state) => state.auth);

  // RTK Queries
  const { data: products = [], isLoading: productsLoading } = useGetAllProductsQuery();
  const [addToCartMut] = useAddToCartMutation();
  const [updateCartMut] = useUpdateCartQuantityMutation();

  // Fetch only if logged in
  useGetProfileQuery(undefined, { skip: !token });
  useGetCartQuery(undefined, { skip: !token });

  // UI Actions
  const setSearch = useCallback((val) => dispatch(setSearchAction(val)), [dispatch]);
  const setShowSearch = useCallback((val) => dispatch(setShowSearchAction(val)), [dispatch]);
  const logout = useCallback(() => {
    dispatch(logoutAction());
    dispatch(clearLocalCart());
  }, [dispatch]);

  // Auth/Legacy Actions
  const setToken = useCallback((t) => dispatch(setCredentials({ token: t })), [dispatch]);
  const setUser = useCallback((u) => dispatch(setCredentials({ user: u })), [dispatch]);
  const setCartItems = useCallback((items) => dispatch(setLocalCartItems(items)), [dispatch]);

  // Cart Actions
  const addToCart = useCallback(
    async (itemId, size) => {
      if (!size) {
        toast.error('Select product size');
        return;
      }
      dispatch(addLocalCartItem({ itemId, size }));
      if (token) {
        try {
          await addToCartMut({ itemId, size }).unwrap();
        } catch (error) {
          toast.error(error?.data?.message || error.message || 'Failed to add to cart');
        }
      }
    },
    [dispatch, token, addToCartMut]
  );

  const updateQuantity = useCallback(
    async (itemId, size, quantity) => {
      dispatch(updateLocalCartQuantity({ itemId, size, quantity }));
      if (token) {
        try {
          await updateCartMut({ itemId, size, quantity }).unwrap();
        } catch (error) {
          toast.error(error?.data?.message || error.message || 'Failed to update cart');
        }
      }
    },
    [dispatch, token, updateCartMut]
  );

  const getCartCount = useCallback(() => {
    let totalCount = 0;
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        if (cartItems[items][item] > 0) totalCount += cartItems[items][item];
      }
    }
    return totalCount;
  }, [cartItems]);

  const getCartAmount = useCallback(() => {
    let totalAmount = 0;
    for (const items in cartItems) {
      const itemInfo = products.find((product) => product._id === items);
      if (!itemInfo) continue;
      for (const item in cartItems[items]) {
        if (cartItems[items][item] > 0) {
          totalAmount += itemInfo.price * cartItems[items][item];
        }
      }
    }
    return totalAmount;
  }, [cartItems, products]);

  return {
    products,
    productsLoading,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    setCartItems,
    addToCart,
    getCartCount,
    updateQuantity,
    getCartAmount,
    navigate,
    token,
    setToken,
    logout,
    user,
    setUser,
  };
};

export default useShop;

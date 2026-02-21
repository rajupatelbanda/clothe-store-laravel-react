import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        const localData = localStorage.getItem('cart');
        return localData ? JSON.parse(localData) : [];
    });

    const [discount, setDiscount] = useState(0);
    const [appliedCoupon, setAppliedCoupon] = useState(null);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
        // Reset discount if cart becomes empty
        if (cart.length === 0) {
            setDiscount(0);
            setAppliedCoupon(null);
        }
    }, [cart]);

    const addToCart = (product, color, size, quantity = 1) => {
        const existingItemIndex = cart.findIndex(item => item.id === product.id && item.color === color && item.size === size);
        if (existingItemIndex > -1) {
            const newCart = [...cart];
            newCart[existingItemIndex].quantity += quantity;
            setCart(newCart);
        } else {
            setCart([...cart, { ...product, color, size, quantity }]);
        }
    };

    const removeFromCart = (id, color, size) => {
        setCart(cart.filter(item => !(item.id === id && item.color === color && item.size === size)));
    };

    const updateQuantity = (id, color, size, quantity) => {
        const newCart = cart.map(item => {
            if (item.id === id && item.color === color && item.size === size) {
                return { ...item, quantity };
            }
            return item;
        });
        setCart(newCart);
    };

    const clearCart = () => {
        setCart([]);
        setDiscount(0);
        setAppliedCoupon(null);
    };

    const applyCoupon = async (code) => {
        try {
            const response = await api.post('/coupons/apply', { code, cart_items: cart });
            setDiscount(response.data.discount);
            setAppliedCoupon(response.data.coupon);
            toast.success(response.data.message);
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid coupon');
            return false;
        }
    };

    const removeCoupon = () => {
        setDiscount(0);
        setAppliedCoupon(null);
        toast.success('Coupon removed');
    };

    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = subtotal > 0 && subtotal < 999 ? 60 : 0;
    const cartTotal = Math.max(0, subtotal + shipping - discount);

    return (
        <CartContext.Provider value={{ 
            cart, addToCart, removeFromCart, updateQuantity, 
            clearCart, subtotal, shipping, discount, appliedCoupon, 
            cartTotal, applyCoupon, removeCoupon 
        }}>
            {children}
        </CartContext.Provider>
    );
};

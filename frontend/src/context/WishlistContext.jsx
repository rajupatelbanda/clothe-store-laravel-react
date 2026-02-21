import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from './AuthContext';
import { toast } from 'react-hot-toast';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            fetchWishlist();
        } else {
            setWishlist([]);
        }
    }, [user]);

    const fetchWishlist = async () => {
        setLoading(true);
        try {
            const response = await api.get('/wishlist');
            setWishlist(response.data);
        } catch (error) {}
        setLoading(false);
    };

    const toggleWishlist = async (productId) => {
        if (!user) {
            toast.error('Please login to add to wishlist');
            return;
        }

        const existingItem = wishlist.find(item => item.product_id === productId);

        if (existingItem) {
            try {
                await api.delete(`/wishlist/${existingItem.id}`);
                setWishlist(wishlist.filter(item => item.id !== existingItem.id));
                toast.success('Removed from wishlist');
            } catch (error) {
                toast.error('Failed to remove from wishlist');
            }
        } else {
            try {
                const response = await api.post('/wishlist', { product_id: productId });
                setWishlist([...wishlist, response.data]);
                toast.success('Added to wishlist');
            } catch (error) {
                toast.error('Failed to add to wishlist');
            }
        }
    };

    const isInWishlist = (productId) => {
        return wishlist.some(item => item.product_id === productId);
    };

    return (
        <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, loading }}>
            {children}
        </WishlistContext.Provider>
    );
};

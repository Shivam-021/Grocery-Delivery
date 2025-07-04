import { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { dummyProducts } from "../assets/assets";
import { toast } from "react-hot-toast";
import axios from "axios"


axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {

  const currency =  import.meta.env.VITE_CURRENCY 
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const  [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const[searchQuery, setSearchQuery] = useState({});


  // fetch seller status
  const fetchSeller = async ()=>{
    try {
      const {data} = await axios.get('/api/seller/isAuth');
      if(data.success){
        setIsSeller(true)
      }else{
        setIsSeller(false)
      }
      
    } catch (error) {
      setIsSeller(false)
    }
  }

  // fetch user auth stauts, user data and cart items
const fetchUser = async ()=>{
    try {
      const {data} = await axios.get('/api/user/isAuth');
      if(data.success){
        setUser(data.user)
        setCartItems(data.user.cartItems)
      } 
      
    } catch (error) {
      setUser(null)
    }
  }


// fetch products from dummy data
  const fetchProducts = async () => {
    try {
      const {data} = await  axios.get('/api/product/list')
      if(data.success){
        setProducts(data.products)
      }
      else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  };

  // add product to cart
  const addToCart = (itemId) => {
  let cartData = structuredClone(cartItems)

  if (cartData[itemId]) {
      cartData[itemId] += 1;
    } else {
      cartData[itemId] = 1;
    }
    setCartItems(cartData);
    toast.success("Added to cart successfully!");
  };


  // upadet cart item count

  const updateCartItemCount = (itemId, quantity) => {
  let cartData = structuredClone(cartItems);
  cartData[itemId] = quantity;
  setCartItems(cartData);
  toast.success("Cart updated successfully!");
  }

  // remove item from cart
  const removeFromCart = (itemId) => {
    let cartData = structuredClone(cartItems);
     if (cartData[itemId]) {
        cartData[itemId] -= 1;
      if (cartData[itemId] === 0) {
        delete cartData[itemId];
      } 
      }
      toast.success("Item removed from cart successfully!");
      setCartItems(cartData);
  }

  //get cart item count

const getCartCount = () => {
  let totalCount = 0;

  for (const itemId in cartItems) {
    const quantity = cartItems[itemId];
    if (quantity > 0) {
      totalCount += quantity;
    }
  }
    return totalCount;
  // return Math.max(0, totalCount - 1); // Ensure it never goes negative
};


// Get cart total amount

const getCartAmount = () => {
  let totalAmount = 0;

  for (const itemId in cartItems) {
    const quantity = cartItems[itemId];
    if (quantity > 0) {
      const itemInfo = products.find((product) => product._id === itemId);
      if (itemInfo) {
        totalAmount += (itemInfo.offerPrice || 0) * quantity ;
      }
    }
  }

  return Math.floor(totalAmount * 100) / 100; // Optional: can use toFixed(2) for string format
};

   


  useEffect(() => {
    fetchUser();
    fetchProducts();
    fetchSeller();
  }, []);

  // update database cart items
  useEffect(()=>{

  const updateCart = async ()=>{
    try {
      const{data} = await axios.post('/api/cart/update', {userId: user._id,cartItems})
      if(!data.success){
        toast.error(data.message)
      }
      
    } catch (error) {
       toast.error(error.message)
    }
  }

  if(user){
    updateCart()
  }  
  },[cartItems])

  const value = {
    user,
    setUser,
    isSeller,
    setIsSeller,
    navigate,
    showUserLogin,
    setShowUserLogin,
    products,
    setProducts,
    currency,
    cartItems,
    setCartItems,
    removeFromCart,
    addToCart,
    updateCartItemCount,
    fetchProducts,
    searchQuery,
    setSearchQuery,
    getCartAmount,
    getCartCount,
    axios,

  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
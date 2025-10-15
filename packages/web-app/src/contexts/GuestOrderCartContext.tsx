import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

interface CartItem {
  id: number;
  quantity: number;
  price: number;
  displayName: string;
  imageUrl: string | null;
  conditionName: string;
  stockNumber: number;
}

interface GuestOrderCartContextType {
  cartItems: CartItem[];
  totalQuantity: number;
  totalPrice: number;
  addToCart: (
    id: number,
    quantity: number,
    price: number,
    displayName: string,
    imageUrl: string | null,
    conditionName: string,
    stockNumber: number,
  ) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
}

const GuestOrderCartContext = createContext<
  GuestOrderCartContextType | undefined
>(undefined);

export const GuestOrderCartProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  // カートの合計をリアルタイムに更新
  useEffect(() => {
    const newTotalQuantity = cartItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    const newTotalPrice = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    setTotalQuantity(newTotalQuantity);
    setTotalPrice(newTotalPrice);
  }, [cartItems]);

  const addToCart = (
    id: number,
    quantity: number,
    price: number,
    displayName: string,
    imageUrl: string | null,
    conditionName: string,
    stockNumber: number,
  ) => {
    setCartItems((prevCart) => {
      const existingItemIndex = prevCart.findIndex((item) => item.id === id);
      if (existingItemIndex !== -1) {
        // 既存のアイテムを更新
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity,
        };
        return updatedCart;
      } else {
        // 新しいアイテムを追加
        return [
          ...prevCart,
          {
            id,
            quantity,
            price,
            displayName,
            imageUrl,
            conditionName,
            stockNumber,
          },
        ];
      }
    });
  };

  const removeFromCart = (id: number) => {
    setCartItems((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
    setTotalQuantity(0);
    setTotalPrice(0);
  };

  return (
    <GuestOrderCartContext.Provider
      value={{
        cartItems,
        totalQuantity,
        totalPrice,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </GuestOrderCartContext.Provider>
  );
};

export const useGuestOrderCart = () => {
  const context = useContext(GuestOrderCartContext);
  if (!context) {
    throw new Error(
      'useGuestOrderCart must be used within a GuestOrderCartProvider',
    );
  }
  return context;
};

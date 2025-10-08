import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ConfirmationModalContextProps {
  isModalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
}

const ConfirmationModalContext = createContext<
  ConfirmationModalContextProps | undefined
>(undefined);

export const useConfirmationModal = (): ConfirmationModalContextProps => {
  const context = useContext(ConfirmationModalContext);
  if (!context) {
    throw new Error(
      'useConfirmationModal must be used within a ConfirmationModalProvider',
    );
  }
  return context;
};

interface ConfirmationModalProviderProps {
  children: ReactNode;
}

export const ConfirmationModalProvider: React.FC<
  ConfirmationModalProviderProps
> = ({ children }) => {
  const [isModalVisible, setModalVisible] = useState(false);

  return (
    <ConfirmationModalContext.Provider
      value={{ isModalVisible, setModalVisible }}
    >
      {children}
    </ConfirmationModalContext.Provider>
  );
};

export { ConfirmationModalContext };

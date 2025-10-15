'use client';

import { ReactNode, createContext, useContext, useState } from 'react';

type HeaderContextType = {
  headerContent: ReactNode;
  setHeaderContent: (content: ReactNode) => void;
};

const HeaderContext = createContext<HeaderContextType>({
  headerContent: null,
  setHeaderContent: () => {},
});

export const HeaderProvider = ({ children }: { children: ReactNode }) => {
  const [headerContent, setHeaderContent] = useState<ReactNode>(null);

  return (
    <HeaderContext.Provider value={{ headerContent, setHeaderContent }}>
      {children}
    </HeaderContext.Provider>
  );
};

export const useHeader = () => {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error('useHeader must be used within a HeaderProvider');
  }
  return context;
};

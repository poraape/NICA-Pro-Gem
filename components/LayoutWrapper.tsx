import React from 'react';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ children }) => {
  return (
    <div className="w-full flex justify-center bg-cream-100 min-h-screen">
      {/* 
        Constraints:
        - Mobile: 100% width, px-4
        - Tablet/Desktop: max-w-5xl, px-6/8
        - Safe Area Bottom padding (pb-safe) 
      */}
      <div className="w-full max-w-5xl px-4 sm:px-6 lg:px-8 pb-safe pt-2">
        {children}
      </div>
    </div>
  );
};
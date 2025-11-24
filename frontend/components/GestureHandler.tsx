import React, { useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface GestureHandlerProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onRefresh?: () => Promise<void>;
}

export const GestureHandler: React.FC<GestureHandlerProps> = ({ 
  children, 
  onSwipeLeft, 
  onSwipeRight, 
  onRefresh 
}) => {
  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);
  
  // Pull to refresh state
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Thresholds
  const MIN_SWIPE_DISTANCE = 50;
  const REFRESH_THRESHOLD = 80;

  const onTouchStart = (e: React.TouchEvent) => {
    touchEnd.current = null;
    touchStart.current = e.targetTouches[0].clientX;
    
    // For pull to refresh, only if at top of page
    if (window.scrollY === 0) {
       // We track Y logic separately if needed, for now simplify horizontal
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX;
    
    // Simple vertical pull logic could go here
    // But forcing purely horizontal for navigation now to avoid conflict
  };

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    
    const distance = touchStart.current - touchEnd.current;
    const isLeftSwipe = distance > MIN_SWIPE_DISTANCE;
    const isRightSwipe = distance < -MIN_SWIPE_DISTANCE;
    
    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    }
    
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }
    
    // Reset
    touchStart.current = null;
    touchEnd.current = null;
  };

  return (
    <div 
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="min-h-screen relative"
    >
       {/* Pull Indicator (Visual only for now) */}
       {isRefreshing && (
         <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-white p-2 rounded-full shadow-md">
            <Loader2 className="animate-spin text-primary-500" size={20} />
         </div>
       )}
       {children}
    </div>
  );
};
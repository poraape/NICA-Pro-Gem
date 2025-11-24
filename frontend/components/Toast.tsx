import React, { useCallback, useEffect, useState } from 'react';
import { tokens } from '../design-system/tokens';
import { useAnimation } from '../contexts/AnimationContext';

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-center' | 'bottom-center' | 'top-right' | 'bottom-right';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastProps {
  messages: ToastMessage[];
  onDismiss: (id: string) => void;
  position?: ToastPosition;
  maxVisible?: number;
}

export const ToastContainer: React.FC<ToastProps> = ({
  messages,
  onDismiss,
  position = 'bottom-center',
  maxVisible = 3,
}) => {
  const visibleMessages = messages.slice(0, maxVisible);

  const positionStyles: Record<ToastPosition, React.CSSProperties> = {
    'top-center': { top: tokens.spacing['6'], left: '50%', transform: 'translateX(-50%)' },
    'bottom-center': { bottom: tokens.spacing['6'], left: '50%', transform: 'translateX(-50%)' },
    'top-right': { top: tokens.spacing['6'], right: tokens.spacing['6'] },
    'bottom-right': { bottom: tokens.spacing['6'], right: tokens.spacing['6'] },
  };

  return (
    <div
      style={{
        position: 'fixed',
        ...positionStyles[position],
        zIndex: tokens.zIndex.toast,
        display: 'flex',
        flexDirection: position.includes('top') ? 'column' : 'column-reverse',
        gap: tokens.spacing['3'],
        pointerEvents: 'none',
      }}
      role="region"
      aria-live="polite"
      aria-label="Notifications"
    >
      {visibleMessages.map((msg) => (
        <Toast key={msg.id} {...msg} onDismiss={() => onDismiss(msg.id)} />
      ))}
    </div>
  );
};

interface SingleToastProps extends ToastMessage {
  onDismiss: () => void;
}

const Toast: React.FC<SingleToastProps> = ({
  message,
  type,
  duration,
  action,
  onDismiss,
}) => {
  const { isReducedMotion } = useAnimation();
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => onDismiss(), 300);
  }, [onDismiss]);

  const computedDuration = action && duration === undefined
    ? Infinity
    : duration ?? getOptimalDuration(message, type);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  useEffect(() => {
    if (computedDuration === Infinity) return;

    const interval = 50;
    const decrement = (interval / computedDuration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev - decrement;
        if (next <= 0) {
          handleDismiss();
          return 0;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [computedDuration, handleDismiss]);

  const typeStyles = {
    success: {
      background: tokens.colors.cognitive.successPastel,
      border: `2px solid ${tokens.colors.cognitive.success}`,
      icon: '✅',
      color: tokens.colors.cognitive.success,
      progressColor: tokens.colors.cognitive.success,
    },
    error: {
      background: 'rgba(255, 84, 89, 0.1)',
      border: `2px solid ${tokens.colors.cognitive.error}`,
      icon: '⚠️',
      color: tokens.colors.cognitive.error,
      progressColor: tokens.colors.cognitive.error,
    },
    warning: {
      background: 'rgba(232, 125, 74, 0.1)',
      border: `2px solid ${tokens.colors.cognitive.warning}`,
      icon: '⚡',
      color: tokens.colors.cognitive.warning,
      progressColor: tokens.colors.cognitive.warning,
    },
    info: {
      background: 'rgba(32, 129, 146, 0.1)',
      border: `2px solid ${tokens.colors.action.primary}`,
      icon: 'ℹ️',
      color: tokens.colors.action.primary,
      progressColor: tokens.colors.action.primary,
    },
  };

  const currentStyle = typeStyles[type];

  return (
    <div
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      style={{
        position: 'relative',
        minWidth: '320px',
        maxWidth: '420px',
        padding: tokens.spacing['4'],
        backgroundColor: currentStyle.background,
        backdropFilter: tokens.effects.glass.backdrop,
        border: currentStyle.border,
        borderRadius: tokens.effects.borderRadius.lg,
        boxShadow: tokens.effects.shadows.lg,
        display: 'flex',
        alignItems: 'flex-start',
        gap: tokens.spacing['3'],
        pointerEvents: 'auto',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: isReducedMotion ? 'none' : `
          opacity ${tokens.animation.timing.normal} ${tokens.animation.easing.decelerate},
          transform ${tokens.animation.timing.normal} ${tokens.animation.easing.decelerate}
        `,
      }}
    >
      <div style={{ fontSize: '20px', lineHeight: 1 }}>
        {currentStyle.icon}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: tokens.spacing['2'] }}>
        <p
          style={{
            margin: 0,
            fontSize: tokens.typography.size.bodySmall,
            fontWeight: tokens.typography.weight.medium,
            color: tokens.colors.text.primary,
            lineHeight: tokens.typography.lineHeight.normal,
          }}
        >
          {message}
        </p>

        {action && (
          <button
            onClick={() => {
              action.onClick();
              handleDismiss();
            }}
            style={{
              alignSelf: 'flex-start',
              padding: `${tokens.spacing['1']} ${tokens.spacing['3']}`,
              fontSize: tokens.typography.size.caption,
              fontWeight: tokens.typography.weight.semibold,
              color: currentStyle.color,
              backgroundColor: 'transparent',
              border: `1px solid ${currentStyle.color}`,
              borderRadius: tokens.effects.borderRadius.sm,
              cursor: 'pointer',
              transition: isReducedMotion
                ? 'none'
                : `background-color ${tokens.animation.timing.fast} ${tokens.animation.easing.standard}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `${currentStyle.color}15`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {action.label}
          </button>
        )}
      </div>

      <button
        onClick={handleDismiss}
        aria-label="Dismiss notification"
        style={{
          padding: tokens.spacing['1'],
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: '18px',
          lineHeight: 1,
          color: tokens.colors.text.tertiary,
          transition: isReducedMotion
            ? 'none'
            : `color ${tokens.animation.timing.fast} ${tokens.animation.easing.standard}`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = tokens.colors.text.primary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = tokens.colors.text.tertiary;
        }}
      >
        ✕
      </button>

      {computedDuration !== Infinity && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '3px',
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
            borderRadius: `0 0 ${tokens.effects.borderRadius.lg} ${tokens.effects.borderRadius.lg}`,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: currentStyle.progressColor,
              transition: isReducedMotion ? 'none' : 'width 50ms linear',
            }}
          />
        </div>
      )}
    </div>
  );
};

function getOptimalDuration(message: string, type: ToastType): number {
  const words = message.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = (words / 3.3) * 1000;
  const buffer = type === 'error' ? 2000 : 1000;
  const baseDuration = Math.max(3000, readingTime + buffer);

  return Math.min(baseDuration, 10000);
}

export const useToast = () => {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const show = useCallback((
    type: ToastType,
    message: string,
    options?: { duration?: number; action?: ToastMessage['action'] }
  ) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setMessages((prev) => [...prev, { id, type, message, ...options }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  }, []);

  return { messages, show, dismiss };
};


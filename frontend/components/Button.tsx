import React from 'react';
import { tokens } from '../design-system/tokens';
import { useAnimation } from '../contexts/AnimationContext';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  haptic?: boolean;
}

const SPINNER_KEYFRAMES_ID = 'button-spinner-keyframes';

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'lg',
  isLoading = false,
  fullWidth = false,
  icon,
  haptic = true,
  className = '',
  disabled,
  onClick,
  style,
  ...props
}) => {
  const { isReducedMotion } = useAnimation();
  const [isPressed, setIsPressed] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);

  React.useEffect(() => {
    if (document.getElementById(SPINNER_KEYFRAMES_ID)) return;

    const styleTag = document.createElement('style');
    styleTag.id = SPINNER_KEYFRAMES_ID;
    styleTag.textContent = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(styleTag);
  }, []);

  const sizeStyles = {
    sm: {
      height: '32px',
      padding: '0 12px',
      fontSize: tokens.typography.size.bodySmall,
      iconSize: '14px',
    },
    md: {
      height: '44px',
      padding: '0 24px',
      fontSize: tokens.typography.size.body,
      iconSize: '16px',
    },
    lg: {
      height: '52px',
      padding: '0 32px',
      fontSize: tokens.typography.size.body,
      iconSize: '20px',
    },
  } as const;

  const variantStyles = {
    primary: {
      background: tokens.colors.action.primary,
      backgroundHover: tokens.colors.action.primaryHover,
      backgroundActive: tokens.colors.action.primaryActive,
      color: tokens.colors.text.inverse,
      border: 'none',
      shadow: `0 4px 12px ${tokens.colors.action.primaryGlow}`,
      shadowHover: `0 8px 24px ${tokens.colors.action.primaryGlow}, 0 0 20px ${tokens.colors.action.primaryGlow}`,
    },
    secondary: {
      background: tokens.colors.backgrounds.white,
      backgroundHover: tokens.colors.backgrounds.offWhite,
      backgroundActive: tokens.colors.backgrounds.cream,
      color: tokens.colors.action.primary,
      border: `1px solid ${tokens.colors.glass.border}`,
      shadow: tokens.effects.shadows.sm,
      shadowHover: tokens.effects.shadows.md,
    },
    tertiary: {
      background: 'transparent',
      backgroundHover: 'rgba(32, 129, 146, 0.05)',
      backgroundActive: 'rgba(32, 129, 146, 0.1)',
      color: tokens.colors.action.primary,
      border: 'none',
      shadow: 'none',
      shadowHover: 'none',
    },
    destructive: {
      background: tokens.colors.cognitive.error,
      backgroundHover: '#A01228',
      backgroundActive: '#800F20',
      color: tokens.colors.text.inverse,
      border: 'none',
      shadow: '0 4px 12px rgba(192, 21, 48, 0.3)',
      shadowHover: '0 8px 24px rgba(192, 21, 48, 0.4)',
    },
  } as const;

  const currentSize = sizeStyles[size];
  const currentVariant = variantStyles[variant];

  const handlePress = () => {
    if (haptic && navigator.vibrate && !disabled) {
      navigator.vibrate(5);
    }
    setIsPressed(true);
  };

  const handleRelease = () => {
    setIsPressed(false);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && onClick) {
      onClick(e);
    }
  };

  const boxShadow = isPressed
    ? 'none'
    : isFocused
      ? `${currentVariant.shadow}, 0 0 0 4px ${tokens.colors.action.primaryGlow}`
      : isHovered
        ? currentVariant.shadowHover
        : currentVariant.shadow;

  const backgroundColor = isPressed
    ? currentVariant.backgroundActive
    : isHovered
      ? currentVariant.backgroundHover
      : currentVariant.background;

  const computedStyle: React.CSSProperties = {
    height: currentSize.height,
    padding: currentSize.padding,
    width: fullWidth ? '100%' : 'auto',
    fontSize: currentSize.fontSize,
    fontWeight: tokens.typography.weight.semibold,
    fontFamily: tokens.typography.fontFamily.base,
    backgroundColor,
    color: currentVariant.color,
    border: currentVariant.border,
    borderRadius: tokens.effects.borderRadius.lg,
    boxShadow,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: isReducedMotion
      ? 'none'
      : `background-color ${tokens.animation.timing.fast} ${tokens.animation.easing.standard},
         box-shadow ${tokens.animation.timing.normal} ${tokens.animation.easing.standard},
         transform ${tokens.animation.timing.instant} ${tokens.animation.easing.spring}`,
    transform: isPressed ? 'scale(0.97)' : 'scale(1)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    outline: 'none',
    ...style,
  };

  return (
    <button
      className={className}
      style={computedStyle}
      disabled={disabled || isLoading}
      onClick={handleClick}
      onMouseDown={handlePress}
      onMouseUp={handleRelease}
      onMouseLeave={() => {
        handleRelease();
        setIsHovered(false);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onTouchStart={handlePress}
      onTouchEnd={handleRelease}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      aria-disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            width={currentSize.iconSize}
            height={currentSize.iconSize}
            viewBox="0 0 24 24"
            fill="none"
            style={{
              animation: isReducedMotion ? 'none' : 'spin 1s linear infinite',
            }}
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              strokeOpacity="0.25"
            />
            <path
              d="M12 2a10 10 0 0 1 10 10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <span>Processando...</span>
        </>
      ) : (
        <>
          {icon && (
            <span
              style={{
                fontSize: currentSize.iconSize,
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {icon}
            </span>
          )}
          {children}
        </>
      )}
    </button>
  );
};

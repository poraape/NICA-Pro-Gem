import React from 'react';
import { tokens } from '../design-system/tokens';
import { useAnimation } from '../contexts/AnimationContext';

interface GlassCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'interactive';
  padding?: keyof typeof tokens.spacing;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'default',
  padding = '6', // 24px default
  className = '',
  onClick,
  style,
}) => {
  const { isReducedMotion } = useAnimation();
  const [isHovered, setIsHovered] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);

  const variantStyles = {
    default: {
      background: tokens.effects.glass.background,
      backdropFilter: tokens.effects.glass.backdrop,
      border: tokens.effects.glass.border,
      boxShadow: tokens.effects.glass.shadow,
      transform: 'translateY(0)',
      cursor: onClick ? 'pointer' : 'default',
    },
    elevated: {
      background: 'rgba(255, 255, 255, 0.7)', // Mais opaco
      backdropFilter: 'blur(15px) saturate(180%)', // Blur aumentado
      border: '1px solid rgba(255, 255, 255, 0.6)',
      boxShadow: tokens.effects.shadows.lg,
      transform: 'translateY(0)',
      cursor: onClick ? 'pointer' : 'default',
    },
    interactive: {
      background: tokens.effects.glass.background,
      backdropFilter: tokens.effects.glass.backdrop,
      border: tokens.effects.glass.border,
      boxShadow: isHovered ? tokens.effects.shadows.lg : tokens.effects.shadows.md,
      transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
      cursor: 'pointer',
    },
  };

  const currentVariant = variantStyles[variant];
  const focusRing = `0 0 0 4px ${tokens.colors.action.primaryGlow}`;
  const transition = isReducedMotion
    ? 'none'
    : `
      transform ${tokens.animation.timing.normal} ${tokens.animation.easing.decelerate},
      box-shadow ${tokens.animation.timing.normal} ${tokens.animation.easing.standard}
    `;

  const cardStyle: React.CSSProperties = {
    ...currentVariant,
    padding: tokens.spacing[padding],
    borderRadius: tokens.effects.borderRadius.lg, // 16px
    transition,
    boxShadow: isFocused ? `${currentVariant.boxShadow}, ${focusRing}` : currentVariant.boxShadow,
    WebkitBackdropFilter: currentVariant.backdropFilter,
    outline: 'none',
    ...style,
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onClick && variant !== 'interactive') return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      className={className}
      style={cardStyle}
      onClick={onClick}
      onMouseEnter={() => variant === 'interactive' && setIsHovered(true)}
      onMouseLeave={() => variant === 'interactive' && setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onKeyDown={handleKeyDown}
      role={onClick || variant === 'interactive' ? 'button' : undefined}
      tabIndex={onClick || variant === 'interactive' ? 0 : undefined}
    >
      {children}
    </div>
  );
};

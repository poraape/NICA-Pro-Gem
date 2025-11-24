import React, { useState } from 'react';
import { tokens } from '../design-system/tokens';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  icon?: React.ReactNode;
  size?: 'md' | 'lg';
  fullWidth?: boolean;
}

export const NutriInput: React.FC<InputProps> = ({
  label,
  error,
  success,
  hint,
  icon,
  size = 'md',
  fullWidth = true,
  disabled,
  id,
  style,
  onFocus,
  onBlur,
  onChange,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const state = error ? 'error' : success ? 'success' : 'default';

  const stateStyles = {
    default: {
      border: isFocused
        ? `2px solid ${tokens.colors.action.primary}`
        : `1px solid ${tokens.colors.glass.border}`,
      shadow: isFocused
        ? `0 0 0 4px ${tokens.colors.action.primaryGlow}`
        : tokens.effects.shadows.sm,
      labelColor: tokens.colors.text.secondary,
    },
    error: {
      border: `2px solid ${tokens.colors.cognitive.error}`,
      shadow: '0 0 0 4px rgba(192, 21, 48, 0.15)',
      labelColor: tokens.colors.cognitive.error,
    },
    success: {
      border: `2px solid ${tokens.colors.cognitive.success}`,
      shadow: '0 0 0 4px rgba(34, 197, 94, 0.15)',
      labelColor: tokens.colors.cognitive.success,
    },
  } as const;

  const sizeStyles = {
    md: {
      height: '44px',
      paddingX: tokens.spacing['4'],
      fontSize: tokens.typography.size.body,
    },
    lg: {
      height: '52px',
      paddingX: tokens.spacing['4'],
      fontSize: tokens.typography.size.body,
    },
  } as const;

  const currentState = stateStyles[state];
  const currentSize = sizeStyles[size];

  const inputId = id || (label ? `input-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  const hintId = hint || error || success ? `${inputId || 'input'}-hint` : undefined;

  return (
    <div
      style={{
        width: fullWidth ? '100%' : 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacing['2'],
      }}
    >
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: tokens.typography.size.bodySmall,
            fontWeight: tokens.typography.weight.medium,
            color: currentState.labelColor,
            transition: `color ${tokens.animation.timing.fast} ${tokens.animation.easing.standard}`,
          }}
        >
          {label}
        </label>
      )}

      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {icon && (
          <div
            style={{
              position: 'absolute',
              left: tokens.spacing['4'],
              pointerEvents: 'none',
              fontSize: '18px',
              color: tokens.colors.text.tertiary,
              display: 'flex',
              alignItems: 'center',
            }}
            aria-hidden
          >
            {icon}
          </div>
        )}

        <input
          id={inputId}
          style={{
            width: '100%',
            height: currentSize.height,
            padding: icon
              ? `0 ${currentSize.paddingX} 0 ${tokens.spacing['12']}`
              : `0 ${currentSize.paddingX}`,
            fontSize: currentSize.fontSize,
            fontFamily: tokens.typography.fontFamily.base,
            fontWeight: tokens.typography.weight.regular,
            color: tokens.colors.text.primary,
            backgroundColor: tokens.colors.backgrounds.white,
            border: currentState.border,
            borderRadius: tokens.effects.borderRadius.md,
            boxShadow: currentState.shadow,
            outline: 'none',
            transition: `
              border ${tokens.animation.timing.fast} ${tokens.animation.easing.standard},
              box-shadow ${tokens.animation.timing.fast} ${tokens.animation.easing.standard},
              background-color ${tokens.animation.timing.fast} ${tokens.animation.easing.standard}
            `,
            cursor: disabled ? 'not-allowed' : 'text',
            opacity: disabled ? 0.6 : 1,
            ...style,
          }}
          aria-invalid={Boolean(error)}
          aria-describedby={hintId}
          aria-disabled={disabled}
          disabled={disabled}
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
          onChange={(event) => {
            onChange?.(event);
          }}
          {...props}
        />

        {(error || success) && (
          <div
            style={{
              position: 'absolute',
              right: tokens.spacing['4'],
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
            }}
            aria-hidden
          >
            {error ? '⚠️' : '✅'}
          </div>
        )}
      </div>

      {(hint || error || success) && (
        <span
          id={hintId}
          style={{
            fontSize: tokens.typography.size.caption,
            color: error
              ? tokens.colors.cognitive.error
              : success
              ? tokens.colors.cognitive.success
              : tokens.colors.text.tertiary,
            lineHeight: tokens.typography.lineHeight.normal,
          }}
        >
          {error || success || hint}
        </span>
      )}
    </div>
  );
};

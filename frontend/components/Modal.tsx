import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { tokens } from '../design-system/tokens';
import { useAnimation } from '../contexts/AnimationContext';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  footer,
}) => {
  const { isReducedMotion } = useAnimation();
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const sizeMap: Record<NonNullable<ModalProps['size']>, string> = {
    sm: '400px',
    md: '560px',
    lg: '720px',
    xl: '960px',
  };

  // FOCUS TRAP + KEYBOARD NAVIGATION
  useEffect(() => {
    if (!isOpen) return undefined;

    previousActiveElement.current = document.activeElement as HTMLElement;
    modalRef.current?.focus();

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleTabKey);
    document.addEventListener('keydown', handleEscape);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleTabKey);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = previousOverflow;
      previousActiveElement.current?.focus();
    };
  }, [isOpen, closeOnEscape, onClose]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (closeOnBackdropClick && e.target === e.currentTarget) {
        onClose();
      }
    },
    [closeOnBackdropClick, onClose]
  );

  if (!isOpen) return null;

  const modalContent = (
    <>
      {/* BACKDROP COM GLASSMORPHISM */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: tokens.zIndex.modal,
          backgroundColor: 'rgba(31, 33, 33, 0.4)',
          backdropFilter: 'blur(8px) saturate(120%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: tokens.spacing['6'],
          animation: isReducedMotion ? 'none' : 'fadeIn 300ms ease-out',
        }}
        onClick={handleBackdropClick}
        role="presentation"
      >
        {/* MODAL CONTAINER */}
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
          aria-label={title ? undefined : 'Modal dialog'}
          tabIndex={-1}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: sizeMap[size],
            maxHeight: '90vh',
            backgroundColor: tokens.colors.backgrounds.white,
            borderRadius: tokens.effects.borderRadius.xl,
            boxShadow: tokens.effects.shadows.xl,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: isReducedMotion
              ? 'none'
              : 'modalSlideUp 400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          {(title || showCloseButton) && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: tokens.spacing['6'],
                borderBottom: `1px solid ${tokens.colors.glass.border}`,
              }}
            >
              {title && (
                <h2
                  id="modal-title"
                  style={{
                    margin: 0,
                    fontSize: tokens.typography.size.h3,
                    fontWeight: tokens.typography.weight.semibold,
                    color: tokens.colors.text.primary,
                  }}
                >
                  {title}
                </h2>
              )}

              {showCloseButton && (
                <button
                  onClick={onClose}
                  aria-label="Close modal"
                  style={{
                    marginLeft: 'auto',
                    padding: tokens.spacing['2'],
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: tokens.effects.borderRadius.sm,
                    cursor: 'pointer',
                    fontSize: '20px',
                    lineHeight: 1,
                    color: tokens.colors.text.tertiary,
                    transition: `
                      background-color ${tokens.animation.timing.fast},
                      color ${tokens.animation.timing.fast}
                    `,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = tokens.colors.backgrounds.offWhite;
                    e.currentTarget.style.color = tokens.colors.text.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = tokens.colors.text.tertiary;
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          )}

          <div
            style={{
              flex: 1,
              padding: tokens.spacing['6'],
              overflowY: 'auto',
              scrollbarWidth: 'thin',
              scrollbarColor: `${tokens.colors.text.tertiary} ${tokens.colors.backgrounds.offWhite}`,
            }}
          >
            {children}
          </div>

          {footer && (
            <div
              style={{
                padding: tokens.spacing['6'],
                borderTop: `1px solid ${tokens.colors.glass.border}`,
                display: 'flex',
                gap: tokens.spacing['3'],
                justifyContent: 'flex-end',
              }}
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
};

// CSS KEYFRAMES (adicionar ao global)
const keyframes = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes modalSlideUp {
    from {
      opacity: 0;
      transform: translateY(40px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

export const modalKeyframes = keyframes;

// HOOK PARA GERENCIAR ESTADO DO MODAL
export const useModal = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, open, close, toggle };
};

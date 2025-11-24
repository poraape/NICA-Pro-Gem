import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { tokens } from '../design-system/tokens';
import { useAnimation } from '../contexts/AnimationContext';

interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  label?: string;
  showPercentage?: boolean;
  variant?: 'linear' | 'circular';
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  celebrateOnComplete?: boolean;
  milestones?: number[]; // Ex: [25, 50, 75] para celebrações intermediárias
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showPercentage = true,
  variant = 'linear',
  size = 'md',
  color = tokens.colors.action.primary,
  celebrateOnComplete = true,
  milestones = [],
}) => {
  const { isReducedMotion } = useAnimation();
  const canVibrate = typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
  const safeMax = Math.max(max, 1);
  const clampedValue = useMemo(() => Math.min(Math.max(value, 0), safeMax), [value, safeMax]);
  const percentage = useMemo(() => Math.min((clampedValue / safeMax) * 100, 100), [clampedValue, safeMax]);

  const [isCelebrating, setIsCelebrating] = useState(false);
  const [reachedMilestones, setReachedMilestones] = useState<Set<number>>(new Set());
  const prevValueRef = useRef(clampedValue);

  const sizeSpecs = useMemo(
    () => ({
      sm: { height: '4px', fontSize: tokens.typography.size.caption },
      md: { height: '8px', fontSize: tokens.typography.size.bodySmall },
      lg: { height: '12px', fontSize: tokens.typography.size.body },
    }),
    []
  );

  const currentSize = sizeSpecs[size];

  const getProgressiveColor = useCallback(
    (pct: number): string => {
      if (pct < 30) return tokens.colors.cognitive.warning; // Laranja: início
      if (pct < 70) return color; // Cor padrão: meio
      if (pct < 100) return tokens.colors.cognitive.success; // Verde: quase lá
      return tokens.colors.cognitive.success; // Verde saturado: completou!
    },
    [color]
  );

  const progressColor = getProgressiveColor(percentage);

  const triggerMilestoneCelebration = useCallback(
    (milestone: number) => {
      if (canVibrate) {
        navigator.vibrate([30, 50, 30]); // Pattern: tap-pause-tap
      }
      setIsCelebrating(true);
      setTimeout(() => setIsCelebrating(false), 600);
    },
    [canVibrate]
  );

  const triggerCompletionCelebration = useCallback(() => {
    if (canVibrate) {
      navigator.vibrate([50, 100, 50, 100, 100]); // Victory pattern
    }
    setIsCelebrating(true);
    setTimeout(() => setIsCelebrating(false), 1200);
  }, [canVibrate]);

  useEffect(() => {
    const prevValue = prevValueRef.current;

    if (clampedValue > prevValue) {
      milestones.forEach((milestone) => {
        const alreadyReached = reachedMilestones.has(milestone);
        const nowReached = clampedValue >= milestone && prevValue < milestone;

        if (nowReached && !alreadyReached) {
          triggerMilestoneCelebration(milestone);
          setReachedMilestones((prev) => {
            const updated = new Set(prev);
            updated.add(milestone);
            return updated;
          });
        }
      });

      if (percentage >= 100 && prevValue < safeMax && celebrateOnComplete) {
        triggerCompletionCelebration();
      }
    }

    prevValueRef.current = clampedValue;
  }, [
    celebrateOnComplete,
    clampedValue,
    safeMax,
    milestones,
    percentage,
    reachedMilestones,
    triggerCompletionCelebration,
    triggerMilestoneCelebration,
  ]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const styleId = 'progress-bar-keyframes';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(200%); }
      }
      
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
    `;
    document.head.appendChild(style);
  }, []);

  const progressbarAriaProps = {
    role: 'progressbar',
    'aria-valuemin': 0,
    'aria-valuemax': safeMax,
    'aria-valuenow': Math.round(clampedValue),
    'aria-label': label || 'Progress',
  } as const;

  if (variant === 'circular') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: tokens.spacing['2'] }}>
        {label && (
          <span
            style={{
              fontSize: currentSize.fontSize,
              fontWeight: tokens.typography.weight.medium,
              color: tokens.colors.text.secondary,
            }}
          >
            {label}
          </span>
        )}
        <div {...progressbarAriaProps} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress value={percentage} color={progressColor} size={size} isReducedMotion={isReducedMotion} />
          {showPercentage && (
            <span
              style={{
                marginTop: tokens.spacing['2'],
                fontSize: currentSize.fontSize,
                fontWeight: tokens.typography.weight.semibold,
                color: progressColor,
                transition: isReducedMotion ? 'none' : `color ${tokens.animation.timing.normal}`,
              }}
            >
              {Math.round(percentage)}%
            </span>
          )}
        </div>
        {percentage >= 100 && celebrateOnComplete && (
          <div
            style={{
              fontSize: tokens.typography.size.h3,
              animation: isReducedMotion ? 'none' : 'bounce 0.6s ease-in-out',
            }}
          >
            🎉
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing['2'], width: '100%' }}
      {...progressbarAriaProps}
    >
      {(label || showPercentage) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {label && (
            <span
              style={{
                fontSize: currentSize.fontSize,
                fontWeight: tokens.typography.weight.medium,
                color: tokens.colors.text.secondary,
              }}
            >
              {label}
            </span>
          )}
          {showPercentage && (
            <span
              style={{
                fontSize: currentSize.fontSize,
                fontWeight: tokens.typography.weight.semibold,
                color: progressColor,
                transition: isReducedMotion ? 'none' : `color ${tokens.animation.timing.normal}`,
              }}
            >
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      <div
        style={{
          position: 'relative',
          width: '100%',
          height: currentSize.height,
          backgroundColor: tokens.colors.backgrounds.offWhite,
          borderRadius: tokens.effects.borderRadius.full,
          overflow: 'hidden',
          boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${percentage}%`,
            backgroundColor: progressColor,
            borderRadius: tokens.effects.borderRadius.full,
            transition: isReducedMotion
              ? 'none'
              : `width ${tokens.animation.timing.slow} ${tokens.animation.easing.decelerate}, background-color ${tokens.animation.timing.normal} ${tokens.animation.easing.standard}`,
            boxShadow: isCelebrating ? `0 0 20px ${progressColor}, 0 0 40px ${progressColor}` : 'none',
          }}
        />

        {percentage > 0 && percentage < 100 && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: `linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)`,
              animation: isReducedMotion ? 'none' : 'shimmer 2s infinite',
              pointerEvents: 'none',
            }}
          />
        )}

        {milestones.map((milestone) => {
          const milestonePosition = Math.min(Math.max(milestone, 0), safeMax);
          return (
            <div
              key={milestone}
              style={{
                position: 'absolute',
                top: '50%',
                left: `${(milestonePosition / safeMax) * 100}%`,
                transform: 'translate(-50%, -50%)',
                width: '3px',
                height: '150%',
                backgroundColor: reachedMilestones.has(milestone)
                  ? tokens.colors.cognitive.success
                  : tokens.colors.text.tertiary,
                opacity: reachedMilestones.has(milestone) ? 0.8 : 0.3,
                transition: isReducedMotion ? 'none' : `opacity ${tokens.animation.timing.normal}`,
              }}
            />
          );
        })}
      </div>

      {percentage >= 100 && celebrateOnComplete && (
        <div
          style={{
            textAlign: 'center',
            fontSize: tokens.typography.size.h3,
            animation: isReducedMotion ? 'none' : 'bounce 0.6s ease-in-out',
          }}
        >
          🎉
        </div>
      )}
    </div>
  );
};

interface CircularProgressProps {
  value: number; // 0-100
  color: string;
  size: 'sm' | 'md' | 'lg';
  isReducedMotion: boolean;
}

const CircularProgress: React.FC<CircularProgressProps> = ({ value, color, size, isReducedMotion }) => {
  const sizeMap = useMemo(() => ({ sm: 40, md: 64, lg: 96 }), []);
  const strokeMap = useMemo(() => ({ sm: 3, md: 4, lg: 6 }), []);

  const diameter = sizeMap[size];
  const strokeWidth = strokeMap[size];
  const radius = (diameter - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: diameter, height: diameter }}>
      <svg width={diameter} height={diameter} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          stroke={tokens.colors.backgrounds.offWhite}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: isReducedMotion
              ? 'none'
              : `stroke-dashoffset ${tokens.animation.timing.slow} ${tokens.animation.easing.decelerate}`,
          }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: tokens.typography.size.bodySmall,
          fontWeight: tokens.typography.weight.semibold,
          color: tokens.colors.text.primary,
        }}
      >
        {Math.round(value)}%
      </div>
    </div>
  );
};

import React from 'react';
import { GlassCard } from './GlassCard';
import { tokens } from '../design-system/tokens';

interface DashboardMetric {
  label: string;
  value: string;
  unit: string;
  progress: number;
  color: string;
}

interface InsightItem {
  icon: string;
  title: string;
  description: string;
  actionLabel: string;
  sentiment: 'positive' | 'success' | 'neutral';
}

export const Dashboard: React.FC = () => {
  const metrics: DashboardMetric[] = [
    {
      label: 'Calorias',
      value: '1,847',
      unit: 'kcal',
      progress: 0.78,
      color: tokens.colors.action.primary,
    },
    {
      label: 'Proteínas',
      value: '124',
      unit: 'g',
      progress: 0.92,
      color: tokens.colors.cognitive.success,
    },
    {
      label: 'Hidratação',
      value: '2.1',
      unit: 'L',
      progress: 0.53,
      color: tokens.colors.cognitive.info,
    },
  ];

  const insights: InsightItem[] = [
    {
      icon: '🔥',
      title: 'Déficit Calórico',
      description: 'Você está 300 kcal abaixo da meta',
      actionLabel: 'Ver Detalhes',
      sentiment: 'positive',
    },
    {
      icon: '💪',
      title: 'Proteína Ideal',
      description: 'Meta de proteína atingida hoje',
      actionLabel: 'Histórico',
      sentiment: 'success',
    },
  ];

  return (
    <div
      style={{
        padding: tokens.spacing['6'],
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacing['6'],
        backgroundColor: tokens.colors.backgrounds.cream,
        minHeight: '100vh',
      }}
    >
      <GlassCard variant="elevated" padding="8">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacing['4'],
          }}
        >
          <h1
            style={{
              fontSize: tokens.typography.size.h2,
              fontWeight: tokens.typography.weight.semibold,
              color: tokens.colors.text.primary,
              margin: 0,
            }}
          >
            Resumo Nutricional
          </h1>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: tokens.spacing['4'],
            }}
          >
            {metrics.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </div>
        </div>
      </GlassCard>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: tokens.spacing['4'],
        }}
      >
        {insights.map((insight) => (
          <GlassCard key={insight.title} variant="interactive" padding="6">
            <InsightCard {...insight} />
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

interface MetricCardProps extends DashboardMetric {}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, unit, progress, color }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacing['2'],
      }}
    >
      <span
        style={{
          fontSize: tokens.typography.size.caption,
          fontWeight: tokens.typography.weight.medium,
          color: tokens.colors.text.tertiary,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        {label}
      </span>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <span
          style={{
            fontSize: tokens.typography.size.h3,
            fontWeight: tokens.typography.weight.semibold,
            color: tokens.colors.text.primary,
          }}
        >
          {value}
        </span>
        <span
          style={{
            fontSize: tokens.typography.size.bodySmall,
            color: tokens.colors.text.secondary,
          }}
        >
          {unit}
        </span>
      </div>

      <div
        style={{
          width: '100%',
          height: '4px',
          backgroundColor: tokens.colors.backgrounds.offWhite,
          borderRadius: tokens.effects.borderRadius.full,
          overflow: 'hidden',
        }}
        role="progressbar"
        aria-valuenow={Math.round(progress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label} progress`}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: '100%',
            backgroundColor: color,
            transition: `width ${tokens.animation.timing.slow} ${tokens.animation.easing.decelerate}`,
          }}
        />
      </div>
    </div>
  );
};

interface InsightCardProps extends InsightItem {}

const InsightCard: React.FC<InsightCardProps> = ({ icon, title, description, actionLabel, sentiment }) => {
  const sentimentColor = {
    positive: tokens.colors.action.primary,
    success: tokens.colors.cognitive.success,
    neutral: tokens.colors.text.secondary,
  }[sentiment];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacing['3'],
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing['2'] }}>
        <span style={{ fontSize: tokens.typography.size.h3 }} role="img" aria-label="Insight icon">
          {icon}
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span
            style={{
              fontSize: tokens.typography.size.h3,
              fontWeight: tokens.typography.weight.semibold,
              color: tokens.colors.text.primary,
              lineHeight: tokens.typography.lineHeight.tight,
            }}
          >
            {title}
          </span>
          <span
            style={{
              fontSize: tokens.typography.size.body,
              color: tokens.colors.text.secondary,
              lineHeight: tokens.typography.lineHeight.normal,
            }}
          >
            {description}
          </span>
        </div>
      </div>

      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: tokens.spacing['2'],
          fontSize: tokens.typography.size.bodySmall,
          fontWeight: tokens.typography.weight.semibold,
          color: sentimentColor,
          cursor: 'pointer',
          transition: `color ${tokens.animation.timing.fast} ${tokens.animation.easing.standard}`,
        }}
        role="button"
        tabIndex={0}
      >
        <span>{actionLabel}</span>
        <span aria-hidden>→</span>
      </div>
    </div>
  );
};

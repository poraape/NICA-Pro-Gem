import React from 'react';
import { GlassCard } from './GlassCard';
import { tokens } from '../design-system/tokens';
import { DashboardData } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { analyzeNarrative, getIdentityLabel } from '../utils/personalization';

interface DashboardProps {
  data: DashboardData;
  onTabChange?: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ data, onTabChange }) => {
  const { t, formatDate } = useLanguage();
  const profile = data.profile;
  const weeklyPlan = data.weeklyPlan;
  const primaryIdentity =
    profile?.routine?.regionalStyles?.[0] ||
    profile?.routine?.spiritualPractices?.[0] ||
    profile?.routine?.dietaryProfiles?.[0];
  const identityLabel = getIdentityLabel(primaryIdentity);
  const heroDay = weeklyPlan?.days?.[0];
  const heroMeal = heroDay?.meals?.[0];
  const narrativeInsights = analyzeNarrative(
    profile?.routine?.personalNarrative || '',
    (profile?.routine as any) || {}
  );
  const ritualNotice =
    narrativeInsights.ritualNotices[0] ||
    (profile?.routine?.spiritualPractices?.length
      ? `Respeitando ${getIdentityLabel(profile.routine.spiritualPractices[0])} com lembretes de jejum e janela alimentar.`
      : t('setup.story.ritual.empty'));

  const cards = [
    {
      icon: '🌞',
      title: 'Sua luz culinária',
      description: `Sua dieta é tão única quanto sua luz. Plano inspirado em ${identityLabel} e suas memórias.`,
      action: onTabChange ? () => onTabChange('weekly-plan') : undefined,
      cta: onTabChange ? 'Ver plano semanal' : undefined,
    },
    {
      icon: '🍽️',
      title: heroMeal?.name || 'Prato celebrado do dia',
      description:
        heroMeal?.description ||
        `Sugestão cultural: harmonizar um prato afetivo com ${identityLabel} e cuidados clínicos.`,
      action: onTabChange ? () => onTabChange('weekly-plan') : undefined,
      cta: onTabChange ? 'Editar cardápio' : undefined,
    },
    {
      icon: '🕯️',
      title: 'Avisos de rituais',
      description: ritualNotice,
      action: onTabChange ? () => onTabChange('settings') : undefined,
      cta: onTabChange ? 'Ajustar notificações' : undefined,
    },
    {
      icon: '🌿',
      title: 'Adaptações afetivas',
      description: narrativeInsights.adaptations[0] || t('setup.story.adaptations.empty'),
      action: onTabChange ? () => onTabChange('setup') : undefined,
      cta: onTabChange ? 'Contar mais histórias' : undefined,
    },
  ];

  return (
    <div
      style={{
        padding: tokens.spacing['6'],
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacing['4'],
        backgroundColor: tokens.colors.backgrounds.cream,
        minHeight: '100vh',
      }}
    >
      <GlassCard variant="elevated" padding="8">
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing['3'] }}>
          <p
            style={{
              margin: 0,
              fontSize: tokens.typography.size.caption,
              letterSpacing: '0.8px',
              color: tokens.colors.action.primary,
              textTransform: 'uppercase',
              fontWeight: tokens.typography.weight.semibold,
            }}
          >
            Jornadas personalizadas
          </p>
          <h1
            style={{
              fontSize: tokens.typography.size.h2,
              fontWeight: tokens.typography.weight.semibold,
              color: tokens.colors.text.primary,
              margin: 0,
              lineHeight: tokens.typography.lineHeight.tight,
            }}
          >
            {profile?.name ? `Olá, ${profile.name}!` : 'Bem-vindo(a) à Noor'}
          </h1>
          <p
            style={{
              margin: 0,
              color: tokens.colors.text.secondary,
              fontSize: tokens.typography.size.body,
              lineHeight: tokens.typography.lineHeight.normal,
            }}
          >
            Celebramos {identityLabel}. Cada insight considera seus rituais, território e escolhas afetivas.
            {heroDay?.day ? ` Plano ativo gerado em ${formatDate(heroDay.day)}` : ''}.
          </p>
          <div style={{ display: 'flex', gap: tokens.spacing['2'], flexWrap: 'wrap' }}>
            {(profile?.routine?.dietaryProfiles || []).map((p) => (
              <span
                key={p}
                style={{
                  padding: '6px 10px',
                  backgroundColor: tokens.colors.action.primaryPastel,
                  color: tokens.colors.action.primary,
                  borderRadius: tokens.effects.borderRadius.full,
                  fontSize: tokens.typography.size.caption,
                  fontWeight: tokens.typography.weight.semibold,
                }}
              >
                {getIdentityLabel(p)}
              </span>
            ))}
            {(profile?.routine?.regionalStyles || []).map((p) => (
              <span
                key={p}
                style={{
                  padding: '6px 10px',
                  backgroundColor: tokens.colors.cognitive.successPastel,
                  color: tokens.colors.cognitive.success,
                  borderRadius: tokens.effects.borderRadius.full,
                  fontSize: tokens.typography.size.caption,
                  fontWeight: tokens.typography.weight.semibold,
                }}
              >
                {getIdentityLabel(p)}
              </span>
            ))}
            {(profile?.routine?.spiritualPractices || []).map((p) => (
              <span
                key={p}
                style={{
                  padding: '6px 10px',
                  backgroundColor: tokens.colors.cognitive.infoPastel,
                  color: tokens.colors.cognitive.info,
                  borderRadius: tokens.effects.borderRadius.full,
                  fontSize: tokens.typography.size.caption,
                  fontWeight: tokens.typography.weight.semibold,
                }}
              >
                {getIdentityLabel(p)}
              </span>
            ))}
          </div>
        </div>
      </GlassCard>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: tokens.spacing['4'],
        }}
      >
        {cards.map((card) => (
          <GlassCard key={card.title} variant="interactive" padding="6">
            <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing['2'] }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing['2'] }}>
                <span style={{ fontSize: tokens.typography.size.h3 }}>{card.icon}</span>
                <div>
                  <p
                    style={{
                      margin: 0,
                      color: tokens.colors.text.primary,
                      fontWeight: tokens.typography.weight.semibold,
                      fontSize: tokens.typography.size.h4,
                    }}
                  >
                    {card.title}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      color: tokens.colors.text.secondary,
                      fontSize: tokens.typography.size.bodySmall,
                    }}
                  >
                    {card.description}
                  </p>
                </div>
              </div>
              {card.cta && (
                <button
                  onClick={card.action}
                  style={{
                    alignSelf: 'flex-start',
                    padding: '8px 12px',
                    borderRadius: tokens.effects.borderRadius.lg,
                    border: `1px solid ${tokens.colors.action.primary}`,
                    color: tokens.colors.action.primary,
                    backgroundColor: tokens.colors.action.primaryPastel,
                    fontWeight: tokens.typography.weight.semibold,
                    cursor: 'pointer',
                  }}
                >
                  {card.cta}
                </button>
              )}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

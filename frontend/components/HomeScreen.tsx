import React from 'react';
import { tokens } from '../design-system/tokens';
import { GlassCard } from './GlassCard';

// FUNÇÃO PARA SAUDAÇÃO DINÂMICA
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 6) return '🌙 Boa madrugada!';
  if (hour < 12) return '☀️ Bom dia!';
  if (hour < 18) return '🌿 Boa tarde!';
  return '🌙 Boa noite!';
}

interface QuickStatProps {
  label: string;
  value: string;
  color: string;
  icon: React.ReactNode;
}

// QUICKSTAT COMPONENT
function QuickStat({ label, value, color, icon }: QuickStatProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: tokens.spacing['1'],
        background: tokens.colors.backgrounds.white,
        borderRadius: tokens.effects.borderRadius.md,
        padding: `${tokens.spacing['2']} ${tokens.spacing['4']}`,
        boxShadow: tokens.effects.shadows.sm,
        minWidth: 82,
        minHeight: 72,
        border: `1.5px solid ${color}40`,
      }}
    >
      <span
        style={{
          fontSize: 22,
          lineHeight: 1,
          color,
        }}
      >
        {icon}
      </span>
      <span
        style={{
          fontWeight: tokens.typography.weight.semibold,
          color,
          fontSize: tokens.typography.size.body,
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontSize: tokens.typography.size.caption,
          color: tokens.colors.text.tertiary,
          marginTop: '-2px',
        }}
      >
        {label}
      </span>
    </div>
  );
}

export const HomeScreen: React.FC = () => (
  <div
    style={{
      minHeight: '100vh',
      background: `linear-gradient(125deg, ${tokens.colors.action.primary} 0%, ${tokens.colors.cognitive.success} 55%, ${tokens.colors.cognitive.successPastel} 100%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: tokens.spacing['6'],
    }}
  >
    <GlassCard
      variant="elevated"
      padding="8"
      style={{ maxWidth: 430, width: '100%', boxShadow: tokens.effects.shadows.xl }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: tokens.spacing['6'],
          alignItems: 'center',
        }}
      >
        {/* Saudação personalizada */}
        <h1
          style={{
            color: tokens.colors.action.primary,
            fontFamily: tokens.typography.fontFamily.base,
            fontWeight: tokens.typography.weight.semibold,
            fontSize: tokens.typography.size.h1,
            letterSpacing: '-1.5px',
            margin: 0,
          }}
        >
          {getGreeting()}
        </h1>
        <span
          style={{
            fontSize: tokens.typography.size.body,
            color: tokens.colors.text.secondary,
            textAlign: 'center',
            maxWidth: 380,
            fontWeight: tokens.typography.weight.medium,
            lineHeight: tokens.typography.lineHeight.relaxed,
          }}
        >
          Bem-vindo ao <b>Nutri-Insight Pro</b> — cuidado gentil com evidências, nutrição clara e pequenos passos que se encaixam no seu ritmo.
        </span>
        <span
          style={{
            fontSize: tokens.typography.size.bodySmall,
            color: tokens.colors.text.tertiary,
            textAlign: 'center',
            maxWidth: 360,
            lineHeight: tokens.typography.lineHeight.relaxed,
          }}
        >
          Sinta-se acolhido para acompanhar seu bem-estar com leveza: cada dado vira cuidado e cada meta recebe apoio sereno.
        </span>
        {/* Métricas rápidas & CTA */}
        <div
          style={{
            display: 'flex',
            gap: tokens.spacing['4'],
            width: '100%',
            justifyContent: 'space-around',
          }}
        >
          <QuickStat label="Seu ritmo" value="72%" color={tokens.colors.cognitive.success} icon="🍃" />
          <QuickStat label="Plano do momento" value="Balanceada" color={tokens.colors.action.primary} icon="📋" />
          <QuickStat label="Último cuidado" value="Registro hoje" color={tokens.colors.cognitive.info} icon="🥕" />
        </div>
        {/* Call to action */}
        <button
          style={{
            marginTop: tokens.spacing['3'],
            padding: `0 ${tokens.spacing['8']}`,
            height: '52px',
            fontSize: tokens.typography.size.body,
            fontWeight: tokens.typography.weight.semibold,
            background: tokens.colors.action.primary,
            color: tokens.colors.text.inverse,
            border: 'none',
            borderRadius: tokens.effects.borderRadius.full,
            boxShadow: tokens.effects.shadows.lg,
            cursor: 'pointer',
            transition: 'box-shadow 250ms cubic-bezier(0.34,1.56,0.64,1)',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.boxShadow = tokens.effects.shadows.xl;
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.boxShadow = tokens.effects.shadows.lg;
          }}
        >
          Continuar com apoio
        </button>
      </div>
    </GlassCard>
  </div>
);


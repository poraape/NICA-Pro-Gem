export const tokens = {
  // CORES PSICOLÓGICAS — DUAL PROCESS THEORY OPTIMIZED
  colors: {
    // SISTEMA 1 (Rápido/Automático) - Cores de alta salience
    action: {
      primary: '#1F9E9A', // Emerald-Teal: saúde + ciência acolhedora
      primaryHover: '#187B78', // 15% darker = affordance de clique
      primaryActive: '#115B58', // Feedback tátil visual
      primaryGlow: 'rgba(31, 158, 154, 0.32)', // Glow suave para foco rápido
    },

    // SISTEMA 2 (Lento/Deliberado) - Cores de suporte cognitivo
    cognitive: {
      success: '#3DBB8F', // Verde-jade: recompensa calma
      successPastel: '#B6F2D7', // Pastel refrescante = acolhimento pós-ação
      warning: '#F2A659', // Âmbar suave = alerta sem alarme
      error: '#D6455D', // Framboesa: stop signal menos agressivo
      errorLight: '#FF7B90', // Erro recuperável
      info: '#1F9E9A', // Teal consistente = confiança científica
    },

    // FUNDOS - MINIMIZAÇÃO DE CARGA COGNITIVA
    backgrounds: {
      cream: '#FFF8F3', // Base quente = acolhimento visual
      offWhite: '#F6FBF9', // Nuvem suave para elevação L1
      white: '#FFFFFF', // Elevação L2: cards principais
    },

    // TEXTOS - CONTRASTE WCAG AAA (≥7:1)
    text: {
      primary: '#1F2626', // Charcoal levemente aquecido
      secondary: '#2B2F2F', // 90% opacity: info secundária
      tertiary: '#7A8281', // 60% opacity: metadados
      inverse: '#FFFFFF', // Para fundos escuros
    },

    // GLASSMORPHISM - PROFUNDIDADE PERCEPTUAL
    glass: {
      white60: 'rgba(255, 255, 255, 0.6)',
      border: 'rgba(240, 240, 240, 0.6)',
      shadow: 'rgba(16, 61, 63, 0.08)',
    },
  },

  // TIPOGRAFIA SF PRO — LEGIBILIDADE OTIMIZADA
  typography: {
    fontFamily: {
      base: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro", system-ui, sans-serif',
      text: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro", system-ui, sans-serif',
      mono: '"SF Mono", "Monaco", "Courier New", monospace',
    },

    // ESCALA MODULAR (1.25 ratio) - HIERARQUIA CLARA
    size: {
      h1: '34px', // Display: onboarding, empty states
      h2: '28px', // Section headers
      h3: '22px', // Card titles
      body: '16px', // Corpo de texto: 44px altura de linha (1.375)
      bodySmall: '14px', // Metadados, captions
      caption: '12px', // Timestamps, legal
      overline: '11px', // Labels, badges
    },

    // PESOS - HIERARQUIA INFORMACIONAL
    weight: {
      regular: 400, // Texto corrido
      medium: 500, // Ênfases sutis
      semibold: 600, // Botões, CTAs
    },

    // LINE HEIGHTS - ESCANEABILIDADE
    lineHeight: {
      tight: 1.2, // Headlines (h1-h3)
      normal: 1.375, // Body text (ideal para leitura)
      relaxed: 1.5, // Parágrafos longos
    },
  },

  // ESPAÇAMENTO 8PT GRID — HARMONIA VISUAL
  spacing: {
    '0': '0px',
    '1': '4px', // 0.5x base
    '2': '8px', // Base unit
    '3': '12px', // 1.5x base
    '4': '16px', // 2x base
    '5': '20px', // Exceção para touch targets
    '6': '24px', // 3x base
    '8': '32px', // 4x base
    '10': '40px',
    '12': '48px', // 6x base
    '16': '64px',
  },

  // GLASSMORPHISM - PROFUNDIDADE ESPACIAL
  effects: {
    glass: {
      backdrop: 'blur(10px) saturate(150%)',
      background: 'rgba(255, 255, 255, 0.6)',
      border: '1px solid rgba(245, 245, 245, 0.5)',
      shadow: '0 4px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)',
    },

    shadows: {
      sm: '0 1px 3px rgba(0, 0, 0, 0.08)',
      md: '0 4px 12px rgba(0, 0, 0, 0.08)',
      lg: '0 8px 24px rgba(0, 0, 0, 0.12)',
      xl: '0 16px 48px rgba(0, 0, 0, 0.16)',
      glow: '0 0 20px rgba(32, 129, 146, 0.3)', // Para CTAs
    },

    borderRadius: {
      sm: '8px',
      md: '12px',
      lg: '16px',
      xl: '20px',
      full: '9999px',
    },
  },

  // ANIMAÇÕES - PERCEIVED PERFORMANCE
  animation: {
    timing: {
      instant: '50ms', // Feedback tátil
      fast: '150ms', // Hover states
      normal: '300ms', // Transições padrão
      slow: '500ms', // Modals, page transitions
    },

    easing: {
      standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)', // Material standard
      decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)', // Elementos entrando
      accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)', // Elementos saindo
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Bouncy feedback
    },
  },

  // Z-INDEX HIERARCHY
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    overlay: 1200,
    modal: 1300,
    toast: 1400,
  },
} as const;

// TYPE EXPORTS
export type ColorToken = typeof tokens.colors;
export type TypographyToken = typeof tokens.typography;
export type SpacingToken = typeof tokens.spacing;

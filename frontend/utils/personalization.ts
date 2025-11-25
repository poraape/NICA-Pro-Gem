import { DietProfileKey, RoutineData, UserProfile } from '../types';

export type DietIdentityGroup = 'style' | 'regional' | 'spiritual';

export interface DietIdentityOption {
  value: DietProfileKey;
  label: string;
  description: string;
  examples?: string[];
  group: DietIdentityGroup;
  emoji?: string;
  accent?: string;
}

const stylePalette = 'from-amber-50 via-white to-orange-50';
const regionalPalette = 'from-emerald-50 via-white to-cyan-50';
const spiritualPalette = 'from-indigo-50 via-white to-purple-50';

export const dietStyleOptions: DietIdentityOption[] = [
  {
    value: 'mediterranean',
    label: 'Mediterrânea solar',
    description: 'Azeite, peixes, grãos e ervas aromáticas.',
    examples: ['Tabule com grão-de-bico', 'Peixe grelhado com ervas'],
    group: 'style',
    emoji: '🌊',
    accent: stylePalette,
  },
  {
    value: 'low_carb',
    label: 'Low-carb gentil',
    description: 'Carboidratos moderados com fibra e gorduras boas.',
    examples: ['Abobrinha recheada', 'Ovos com espinafre e castanhas'],
    group: 'style',
    emoji: '🥑',
    accent: stylePalette,
  },
  {
    value: 'plant_based',
    label: 'Plant-based vibrante',
    description: 'Vegetais em destaque, proteínas vegetais acolhidas.',
    examples: ['Moqueca de banana-da-terra', 'Tofu grelhado com legumes'],
    group: 'style',
    emoji: '🌱',
    accent: stylePalette,
  },
  {
    value: 'ketogenic',
    label: 'Cetogênica consciente',
    description: 'Mais gorduras boas, carboidratos bem escolhidos.',
    examples: ['Salmão com ghee', 'Creme de coco com nibs'],
    group: 'style',
    emoji: '⚡',
    accent: stylePalette,
  },
  {
    value: 'paleolithic',
    label: 'Paleolítica',
    description: 'Alimentos minimamente processados, raízes e caças.',
    examples: ['Carnes magras com raízes', 'Castanhas e frutas vermelhas'],
    group: 'style',
    emoji: '🪨',
    accent: stylePalette,
  },
  {
    value: 'dash_mind',
    label: 'DASH/MIND',
    description: 'Coração protegido com fibras, grãos e frutas.',
    examples: ['Aveia com frutas vermelhas', 'Peixe com legumes assados'],
    group: 'style',
    emoji: '🫀',
    accent: stylePalette,
  },
  {
    value: 'pescatarian',
    label: 'Pescetariana',
    description: 'Mar e rio como protagonistas, leveza diária.',
    examples: ['Ceviche cítrico', 'Moqueca com dendê suave'],
    group: 'style',
    emoji: '🐟',
    accent: stylePalette,
  },
];

export const regionalOptions: DietIdentityOption[] = [
  {
    value: 'nordestina',
    label: 'Nordestina viva',
    description: 'Baião, cuscuz, coentro suave e afetos de São João.',
    examples: ['Baião de dois com queijo coalho', 'Cuscuz com ovo e legumes'],
    group: 'regional',
    emoji: '🎶',
    accent: regionalPalette,
  },
  {
    value: 'amazonica',
    label: 'Amazônica',
    description: 'Jambu, tucupi, açaí de raiz e peixes de rio.',
    examples: ['Tacacá acolhedor', 'Peixe no tucupi com jambu'],
    group: 'regional',
    emoji: '🌿',
    accent: regionalPalette,
  },
  {
    value: 'caipira',
    label: 'Caipira/Interior',
    description: 'Panelas de ferro, galinhada e quitutes de roça.',
    examples: ['Galinhada com pequi', 'Polenta cremosa com ora-pro-nóbis'],
    group: 'regional',
    emoji: '🍲',
    accent: regionalPalette,
  },
  {
    value: 'colonial',
    label: 'Colonial/Pomerana',
    description: 'Fermentações, embutidos artesanais e bolos de milho.',
    examples: ['Pão de centeio com sementes', 'Joelho de porco com chucrute leve'],
    group: 'regional',
    emoji: '🥨',
    accent: regionalPalette,
  },
  {
    value: 'oriental',
    label: 'Oriental',
    description: 'Miso, gengibre, chás e cozimentos lentos.',
    examples: ['Yakissoba leve', 'Miso com tofu e algas'],
    group: 'regional',
    emoji: '🍱',
    accent: regionalPalette,
  },
  {
    value: 'africana',
    label: 'Africana e Afro-diaspórica',
    description: 'Injera, moambas, dendê ancestral em equilíbrio.',
    examples: ['Moamba de galinha', 'Feijoada de feijão fradinho'],
    group: 'regional',
    emoji: '🪘',
    accent: regionalPalette,
  },
  {
    value: 'urban_br',
    label: 'Urbana/Street Food',
    description: 'Quitutes de feira, lanches de rua e diversidade de quiosque.',
    examples: ['Tapioca criativa', 'Sanduíche de pernil com vinagrete de ervas'],
    group: 'regional',
    emoji: '🌆',
    accent: regionalPalette,
  },
];

export const spiritualOptions: DietIdentityOption[] = [
  {
    value: 'ayurvedic',
    label: 'Ayurvédica por dosha',
    description: 'Pratos que harmonizam Vata, Pitta ou Kapha com especiarias leves.',
    examples: ['Kitchari equilibrante', 'Chá de gengibre com cardamomo'],
    group: 'spiritual',
    emoji: '🪔',
    accent: spiritualPalette,
  },
  {
    value: 'buddhist',
    label: 'Budista',
    description: 'Refeições em janelas definidas, sem aromáticos intensos.',
    examples: ['Sopa leve de legumes', 'Arroz com gergelim e vegetais'],
    group: 'spiritual',
    emoji: '⏳',
    accent: spiritualPalette,
  },
  {
    value: 'hare_krishna',
    label: 'Hare Krishna',
    description: 'Sem alho/cebola, ingredientes vistos como sagrados.',
    examples: ['Sabji suave', 'Khichdi de especiarias doces'],
    group: 'spiritual',
    emoji: '🌸',
    accent: spiritualPalette,
  },
  {
    value: 'rastafari_ital',
    label: 'Rastafari Ital',
    description: 'Natural, vivo, com mínimo processamento.',
    examples: ['Guisado de grão-de-bico', 'Suco vivo com gengibre'],
    group: 'spiritual',
    emoji: '🌿',
    accent: spiritualPalette,
  },
  {
    value: 'ramadan',
    label: 'Jejum Ramadã',
    description: 'Suhoor nutritivo e iftar acolhedor, respeitando luz e sombra.',
    examples: ['Iftar com tâmaras e sopas leves', 'Suhoor com aveia e sementes'],
    group: 'spiritual',
    emoji: '🌙',
    accent: spiritualPalette,
  },
  {
    value: 'yom_kippur',
    label: 'Jejum Yom Kippur',
    description: 'Rituais de jejum e quebra com pratos de memória familiar.',
    examples: ['Challah e sopas claras', 'Kugel assado leve'],
    group: 'spiritual',
    emoji: '🕯️',
    accent: spiritualPalette,
  },
  {
    value: 'lent',
    label: 'Quaresma / Festivais',
    description: 'Tempos de introspecção, pratos sem carne e celebrações locais.',
    examples: ['Peixes assados', 'Ensopados de leguminosas'],
    group: 'spiritual',
    emoji: '🪶',
    accent: spiritualPalette,
  },
  {
    value: 'halal',
    label: 'Halal',
    description: 'Respeito a abates e ingredientes permissíveis.',
    examples: ['Arroz com cordeiro halal', 'Pratos com especiarias suaves'],
    group: 'spiritual',
    emoji: '✨',
    accent: spiritualPalette,
  },
  {
    value: 'kosher',
    label: 'Kosher',
    description: 'Separação e cuidado com preparo e combinações.',
    examples: ['Gefilte fish leve', 'Pratos com challah artesanal'],
    group: 'spiritual',
    emoji: '✡️',
    accent: spiritualPalette,
  },
];

export const dietIdentityCatalog: DietIdentityOption[] = [
  ...dietStyleOptions,
  ...regionalOptions,
  ...spiritualOptions,
];

export interface NarrativeInsights {
  tags: string[];
  adaptations: string[];
  ritualNotices: string[];
  celebration: string;
}

const keywordMappings: { cues: string[]; adaptation: string; tag: string; ritual?: string }[] = [
  {
    cues: ['baião', 'nordeste', 'sao joao', 'forro'],
    adaptation: 'Prato celebrado: Baião de dois com feijão-verde, menos sódio e azeite para manter a memória afetiva.',
    tag: 'Raiz nordestina presente',
  },
  {
    cues: ['tucupi', 'jambu', 'acai', 'amazon'],
    adaptation: 'Inclua tacacá ou peixe no tucupi com jambu, equilibrando acidez com frutas locais.',
    tag: 'Sabores amazônicos em destaque',
  },
  {
    cues: ['quaresma', 'quaresmal', 'sem carne'],
    adaptation: 'Cardápio sem carnes vermelhas com feijões, peixes e azeite aromático.',
    tag: 'Respeito à Quaresma',
    ritual: 'Hoje priorize refeições leves e sem carne, honrando sua Quaresma.',
  },
  {
    cues: ['ramad', 'iftar', 'suhoor', 'jejum'],
    adaptation: 'Distribuir fibras e hidratação no suhoor; sopas e tâmaras no iftar para energia gentil.',
    tag: 'Jejum espiritual guiando o dia',
    ritual: 'Hoje é seu ritual de ayuno. Noor acompanha com luz e respeito nas janelas de suhoor e iftar.',
  },
  {
    cues: ['yom', 'kippur'],
    adaptation: 'Quebra de jejum com sopas claras, challah e hidratação pausada.',
    tag: 'Jejum Yom Kippur acolhido',
    ritual: 'Quebre o jejum com calma, honrando Yom Kippur com pratos de memória familiar.',
  },
  {
    cues: ['bahia', 'dende', 'acaraje'],
    adaptation: 'Use dendê em porção leve, equilibrando com saladas cítricas e feijão-fradinho.',
    tag: 'Axé na cozinha afro-brasileira',
  },
];

export const getIdentityLabel = (value?: DietProfileKey) => {
  const found = dietIdentityCatalog.find((opt) => opt.value === value);
  return found?.label || value || 'perfil';
};

export const analyzeNarrative = (narrative: string, routine: RoutineData): NarrativeInsights => {
  const normalized = (narrative || '').toLowerCase();
  const tags = new Set<string>();
  const adaptations = new Set<string>();
  const ritualNotices = new Set<string>();

  routine.dietaryProfiles?.forEach((key) => {
    const option = dietIdentityCatalog.find((o) => o.value === key);
    if (option) {
      tags.add(`${option.label}`);
      if (option.examples?.length) {
        adaptations.add(`Prato sugerido: ${option.examples[0]}.`);
      }
    }
  });

  routine.regionalStyles?.forEach((key) => {
    const option = dietIdentityCatalog.find((o) => o.value === key);
    if (option?.examples?.length) {
      tags.add(`${option.label} com ${option.examples[0]}`);
      adaptations.add(`Realce regional: ${option.examples[0]} com tempero suave.`);
    }
  });

  routine.spiritualPractices?.forEach((key) => {
    const option = dietIdentityCatalog.find((o) => o.value === key);
    if (option) {
      tags.add(`Ritual ${option.label}`);
      if (option.value === 'ramadan') {
        ritualNotices.add('Hoje é seu ritual de ayuno; manter jejum com hidratação delicada.');
      }
    }
  });

  keywordMappings.forEach((mapping) => {
    if (mapping.cues.some((cue) => normalized.includes(cue))) {
      tags.add(mapping.tag);
      adaptations.add(mapping.adaptation);
      if (mapping.ritual) ritualNotices.add(mapping.ritual);
    }
  });

  const firstIdentity =
    routine.regionalStyles?.[0] ||
    routine.spiritualPractices?.[0] ||
    routine.dietaryProfiles?.[0];

  const celebration = firstIdentity
    ? `Hoje celebramos ${getIdentityLabel(firstIdentity)} e honramos seus rituais.`
    : 'Sua jornada alimentar é única e Noor a celebra com cuidado.';

  return {
    tags: Array.from(tags),
    adaptations: Array.from(adaptations),
    ritualNotices: Array.from(ritualNotices),
    celebration,
  };
};

export const composeCelebrationMessage = (profile: UserProfile) => {
  const { routine, name } = profile;
  const identity =
    routine?.regionalStyles?.[0] ||
    routine?.spiritualPractices?.[0] ||
    routine?.dietaryProfiles?.[0];
  const identityLabel = getIdentityLabel(identity);

  if (!identity) {
    return `Noor recebeu suas preferências, ${name}. Vamos criar um plano que respeita sua história.`;
  }

  return `Olá, ${name || 'explorador(a)'}! Hoje celebramos ${identityLabel}. Cada recomendação honra seus rituais e sabores de origem.`;
};

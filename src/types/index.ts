export interface ContentRequest {
  content_type: 'email' | 'webpage' | 'landing_page' | 'blog' | 'market_update';
  topic: string;
  target_audience?: 'security_seekers' | 'growth_hunters' | 'legacy_builders' | 'crisis_reactors' | 'auto_detect';
  tone_guidance?: string;
  length_target?: 'short' | 'medium' | 'long';
  include_cta?: boolean;
}

export interface KnowledgeSource {
  id: string;
  url: string;
  source_type: 'educational' | 'market_data' | 'competitor' | 'news';
  description?: string;
  tags?: string[];
  last_updated: Date;
  content?: string;
}

export interface ContentOutput {
  content: string;
  seo_metadata?: {
    title: string;
    meta_description: string;
    h1: string;
    h2_suggestions: string[];
    schema_markup?: object;
    keywords: string[];
  };
  compliance_status: {
    brand_voice_score: number;
    disclaimers_included: boolean;
    issues: string[];
  };
  refinement_passes: {
    pass_1_framework: string;
    pass_2_engagement: string;
    pass_3_technical: string;
  };
}

export interface PersonaGuidance {
  persona: string;
  messaging_focus: string;
  pain_points: string[];
  value_propositions: string[];
  tone_adjustments: string;
}

export const LIBERTY_FRAMEWORK = {
  BRAND_VOICE: {
    knowledgeable: 'Evidence-based claims with historical context',
    trustworthy: 'Transparent processes and honest risk assessment',
    professional: 'Timeless tone avoiding trends',
    protective: 'We don\'t push. We protect mindset'
  },
  AUDIENCE: {
    age_range: '45-75',
    characteristics: 'Conservative, skeptical investors focused on wealth preservation',
    motivations: ['protecting wealth from inflation', 'economic uncertainty', 'currency devaluation'],
    pain_points: ['skeptical of traditional financial institutions', 'market volatility concerns', 'geopolitical instability']
  },
  CONTENT_STRUCTURES: {
    inverted_pyramid: 'Critical information first',
    narrative_design: 'Historical context and real-world examples',
    thesis_antithesis_synthesis: 'Present idea, challenge it, offer sophisticated conclusion'
  }
} as const;
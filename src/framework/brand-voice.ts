import { LIBERTY_FRAMEWORK, PersonaGuidance } from '../types/index.js';

export class BrandVoiceEngine {

  static getPersonaGuidance(persona: string): PersonaGuidance {
    const guidanceMap: Record<string, PersonaGuidance> = {
      security_seekers: {
        persona: 'Security Seekers',
        messaging_focus: 'Stability, wealth preservation, protection from economic uncertainty',
        pain_points: [
          'Fear of market volatility',
          'Concern about currency devaluation',
          'Distrust of traditional financial institutions',
          'Worry about retirement security'
        ],
        value_propositions: [
          'Hedge against inflation',
          'Store of value with historical track record',
          'Portfolio diversification away from paper assets',
          'Tangible wealth you can hold'
        ],
        tone_adjustments: 'Emphasize stability, safety, and historical precedent. Use data and evidence to build confidence.'
      },
      growth_hunters: {
        persona: 'Growth Hunters',
        messaging_focus: 'Portfolio enhancement, diversification opportunities, strategic wealth building',
        pain_points: [
          'Over-concentration in traditional investments',
          'Limited diversification options',
          'Concern about market correlations',
          'Seeking uncorrelated assets'
        ],
        value_propositions: [
          'Portfolio diversification benefits',
          'Potential for appreciation during economic stress',
          'Uncorrelated to traditional markets',
          'Strategic allocation for balanced portfolio'
        ],
        tone_adjustments: 'Focus on strategic benefits and portfolio optimization. Emphasize smart allocation principles.'
      },
      legacy_builders: {
        persona: 'Legacy Builders',
        messaging_focus: 'Generational wealth, estate planning, long-term preservation',
        pain_points: [
          'Wealth transfer concerns',
          'Estate tax implications',
          'Long-term value preservation',
          'Intergenerational planning challenges'
        ],
        value_propositions: [
          'Generational wealth preservation',
          'Tangible assets for inheritance',
          'Estate planning benefits',
          'Long-term store of value'
        ],
        tone_adjustments: 'Emphasize legacy, permanence, and multi-generational thinking. Use historical examples.'
      },
      crisis_reactors: {
        persona: 'Crisis Reactors',
        messaging_focus: 'Economic protection, immediate security, crisis hedging',
        pain_points: [
          'Economic uncertainty and instability',
          'Inflation concerns',
          'Geopolitical risks',
          'Currency devaluation fears'
        ],
        value_propositions: [
          'Crisis hedge and safe haven',
          'Protection against economic turmoil',
          'Maintains value during uncertainty',
          'Independent of government and banking systems'
        ],
        tone_adjustments: 'Address immediate concerns while maintaining educational approach. Focus on practical protection benefits.'
      }
    };

    return guidanceMap[persona] || guidanceMap.security_seekers;
  }

  static validateBrandCompliance(content: string): {
    score: number;
    issues: string[];
    disclaimers_included: boolean;
  } {
    const issues: string[] = [];
    let score = 100;

    // Check for aggressive sales language
    const aggressiveTerms = [
      'act now', 'limited time', 'urgent', 'must buy', 'don\'t miss out',
      'guaranteed returns', 'risk-free', 'get rich', 'explosive growth'
    ];

    for (const term of aggressiveTerms) {
      if (content.toLowerCase().includes(term)) {
        issues.push(`Contains aggressive sales language: "${term}"`);
        score -= 15;
      }
    }

    // Check for educational language
    const educationalTerms = [
      'understand', 'learn', 'historical', 'data shows', 'research indicates',
      'consider', 'evaluate', 'analyze', 'factors to consider'
    ];

    const educationalCount = educationalTerms.filter(term =>
      content.toLowerCase().includes(term)
    ).length;

    if (educationalCount < 3) {
      issues.push('Insufficient educational language - needs more informative tone');
      score -= 10;
    }

    // Check for required disclaimers
    const disclaimerKeywords = [
      'not investment advice', 'past performance', 'consult', 'specialist'
    ];

    const disclaimersIncluded = disclaimerKeywords.some(keyword =>
      content.toLowerCase().includes(keyword)
    );

    if (!disclaimersIncluded && content.length > 500) {
      issues.push('Missing required financial disclaimers');
      score -= 20;
    }

    // Check for appropriate audience language
    if (content.includes('yo') || content.includes('bro') || content.includes('lit')) {
      issues.push('Language not appropriate for target demographic (45-75)');
      score -= 15;
    }

    return {
      score: Math.max(0, score),
      issues,
      disclaimers_included: disclaimersIncluded
    };
  }

  static applyBrandVoiceTransformation(request: string): string {
    // Transform any request to align with Trust Through Education philosophy
    const transformations = [
      {
        pattern: /urgent|hurry|act now|limited time/gi,
        replacement: 'consider the importance of'
      },
      {
        pattern: /buy now|purchase immediately/gi,
        replacement: 'explore the benefits of'
      },
      {
        pattern: /guaranteed returns|risk-free/gi,
        replacement: 'historically demonstrated potential for'
      },
      {
        pattern: /get rich|explosive growth/gi,
        replacement: 'wealth preservation and potential appreciation'
      },
      {
        pattern: /don't miss out|last chance/gi,
        replacement: 'understanding the opportunity of'
      }
    ];

    let transformedRequest = request;

    for (const { pattern, replacement } of transformations) {
      transformedRequest = transformedRequest.replace(pattern, replacement);
    }

    // If request is still aggressive, reframe entirely
    if (transformedRequest.toLowerCase().includes('sell') ||
        transformedRequest.toLowerCase().includes('convince')) {
      transformedRequest = `Create educational content about precious metals that helps readers understand ${transformedRequest.toLowerCase().replace(/sell|convince/g, 'the benefits of')}`;
    }

    return transformedRequest;
  }
}
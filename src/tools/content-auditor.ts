import { BrandVoiceEngine } from '../framework/brand-voice.js';
import { LIBERTY_FRAMEWORK } from '../types/index.js';

export interface ContentAudit {
  overall_score: number;
  compliance_status: 'PASSED' | 'NEEDS_IMPROVEMENT' | 'FAILED';
  detailed_analysis: {
    brand_voice: {
      score: number;
      knowledgeable_authoritative: number;
      trustworthy_transparent: number;
      professional_established: number;
      protective_strategic: number;
      issues: string[];
    };
    audience_alignment: {
      score: number;
      age_appropriate: number;
      tone_match: number;
      complexity_level: number;
      issues: string[];
    };
    content_structure: {
      score: number;
      information_hierarchy: number;
      readability: number;
      educational_flow: number;
      issues: string[];
    };
    compliance_requirements: {
      score: number;
      disclaimers_present: boolean;
      risk_disclosures: boolean;
      educational_framing: boolean;
      issues: string[];
    };
    sales_tactics: {
      score: number;
      pressure_tactics: string[];
      urgency_language: string[];
      aggressive_terms: string[];
      trust_vs_push_ratio: number;
    };
  };
  recommendations: {
    immediate_fixes: string[];
    structural_changes: string[];
    voice_adjustments: string[];
    compliance_additions: string[];
  };
  redesign_priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export class ContentAuditor {

  auditContent(content: string, contentType?: string): ContentAudit {
    const brandVoiceAnalysis = this.analyzeBrandVoice(content);
    const audienceAnalysis = this.analyzeAudienceAlignment(content);
    const structureAnalysis = this.analyzeContentStructure(content);
    const complianceAnalysis = this.analyzeCompliance(content);
    const salesTacticsAnalysis = this.analyzeSalesTactics(content);

    const overallScore = this.calculateOverallScore({
      brandVoiceAnalysis,
      audienceAnalysis,
      structureAnalysis,
      complianceAnalysis,
      salesTacticsAnalysis
    });

    const recommendations = this.generateRecommendations({
      brandVoiceAnalysis,
      audienceAnalysis,
      structureAnalysis,
      complianceAnalysis,
      salesTacticsAnalysis
    });

    return {
      overall_score: overallScore,
      compliance_status: this.determineComplianceStatus(overallScore),
      detailed_analysis: {
        brand_voice: brandVoiceAnalysis,
        audience_alignment: audienceAnalysis,
        content_structure: structureAnalysis,
        compliance_requirements: complianceAnalysis,
        sales_tactics: salesTacticsAnalysis
      },
      recommendations,
      redesign_priority: this.determineRedesignPriority(overallScore, complianceAnalysis)
    };
  }

  private analyzeBrandVoice(content: string) {
    const contentLower = content.toLowerCase();

    // Knowledgeable & Authoritative
    const authoritative = this.scoreAuthoritativeness(content);

    // Trustworthy & Transparent
    const trustworthy = this.scoreTrustworthiness(content);

    // Professional & Established
    const professional = this.scoreProfessionalism(content);

    // Protective & Strategic
    const protective = this.scoreProtectiveness(content);

    const issues: string[] = [];
    if (authoritative < 70) issues.push('Lacks authoritative evidence and data');
    if (trustworthy < 70) issues.push('Needs more transparency about risks and processes');
    if (professional < 70) issues.push('Language too casual or trendy for target demographic');
    if (protective < 70) issues.push('Too sales-focused, not protective enough');

    const score = Math.round((authoritative + trustworthy + professional + protective) / 4);

    return {
      score,
      knowledgeable_authoritative: authoritative,
      trustworthy_transparent: trustworthy,
      professional_established: professional,
      protective_strategic: protective,
      issues
    };
  }

  private scoreAuthoritativeness(content: string): number {
    const contentLower = content.toLowerCase();
    let score = 50; // Base score

    // Positive indicators
    const authoritativeTerms = [
      'data shows', 'research indicates', 'historical', 'evidence', 'studies show',
      'according to', 'analysis reveals', 'experts', 'decades of', 'proven',
      'statistics', 'federal reserve', 'treasury', 'economic data', 'market data'
    ];

    const authCount = authoritativeTerms.filter(term => contentLower.includes(term)).length;
    score += authCount * 8;

    // Citations and references
    if (contentLower.includes('source:') || contentLower.includes('according to')) score += 10;
    if (content.match(/\d{4}/g)) score += 5; // Years/dates
    if (content.match(/\d+%/g)) score += 10; // Percentages

    // Negative indicators
    const unsubstantiatedClaims = [
      'everyone knows', 'obviously', 'clearly', 'without a doubt',
      'definitely will', 'guaranteed to', 'always works'
    ];

    const unsubstantiatedCount = unsubstantiatedClaims.filter(term => contentLower.includes(term)).length;
    score -= unsubstantiatedCount * 15;

    return Math.min(100, Math.max(0, score));
  }

  private scoreTrustworthiness(content: string): number {
    const contentLower = content.toLowerCase();
    let score = 50;

    // Transparency indicators
    const transparentTerms = [
      'risk', 'consider', 'factors', 'important to understand',
      'no guarantee', 'past performance', 'potential downsides',
      'consult', 'evaluate', 'assess your situation'
    ];

    const transparentCount = transparentTerms.filter(term => contentLower.includes(term)).length;
    score += transparentCount * 12;

    // Honesty about limitations
    if (contentLower.includes('not investment advice')) score += 15;
    if (contentLower.includes('consult') && contentLower.includes('professional')) score += 10;

    // Trust-building language
    const trustTerms = [
      'our process', 'we believe', 'our approach', 'transparency',
      'honest', 'straightforward', 'clear about'
    ];

    const trustCount = trustTerms.filter(term => contentLower.includes(term)).length;
    score += trustCount * 8;

    // Negative indicators
    const secretiveTerms = [
      'secret', 'exclusive insider', 'hidden opportunity',
      'banks don\'t want you to know', 'wall street hates this'
    ];

    const secretiveCount = secretiveTerms.filter(term => contentLower.includes(term)).length;
    score -= secretiveCount * 20;

    return Math.min(100, Math.max(0, score));
  }

  private scoreProfessionalism(content: string): number {
    const contentLower = content.toLowerCase();
    let score = 70; // Higher base for professional tone

    // Professional language indicators
    const professionalTerms = [
      'portfolio', 'allocation', 'diversification', 'investment strategy',
      'wealth preservation', 'financial planning', 'asset class',
      'market conditions', 'economic factors'
    ];

    const profCount = professionalTerms.filter(term => contentLower.includes(term)).length;
    score += profCount * 5;

    // Avoid trendy/casual language
    const casualTerms = [
      'awesome', 'amazing', 'incredible', 'unbelievable', 'crazy',
      'insane', 'wild', 'epic', 'mind-blowing', 'game-changer'
    ];

    const casualCount = casualTerms.filter(term => contentLower.includes(term)).length;
    score -= casualCount * 15;

    // Age-appropriate complexity
    const sentences = content.split('.').filter(s => s.trim().length > 0);
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;

    if (avgSentenceLength > 30 && avgSentenceLength < 80) score += 10; // Good complexity
    if (avgSentenceLength > 100) score -= 10; // Too complex

    return Math.min(100, Math.max(0, score));
  }

  private scoreProtectiveness(content: string): number {
    const contentLower = content.toLowerCase();
    let score = 50;

    // Protective language
    const protectiveTerms = [
      'protect', 'preserve', 'safeguard', 'hedge against',
      'shield from', 'defense against', 'security', 'stability',
      'wealth preservation', 'protection from inflation'
    ];

    const protectiveCount = protectiveTerms.filter(term => contentLower.includes(term)).length;
    score += protectiveCount * 10;

    // Educational vs sales ratio
    const educationalTerms = [
      'understand', 'learn', 'consider', 'evaluate', 'analyze',
      'factors', 'important to know', 'key points', 'things to consider'
    ];

    const salesTerms = [
      'buy now', 'purchase', 'order', 'call today', 'don\'t wait',
      'limited time', 'act fast', 'special offer', 'discount'
    ];

    const eduCount = educationalTerms.filter(term => contentLower.includes(term)).length;
    const salesCount = salesTerms.filter(term => contentLower.includes(term)).length;

    if (eduCount > salesCount * 2) score += 15; // Educational focus
    if (salesCount > eduCount) score -= 20; // Too sales-heavy

    return Math.min(100, Math.max(0, score));
  }

  private analyzeAudienceAlignment(content: string) {
    const contentLower = content.toLowerCase();
    let score = 50;
    const issues: string[] = [];

    // Age-appropriate language (45-75 demographic)
    const ageAppropriate = this.scoreAgeAppropriateness(content);

    // Tone match for conservative investors
    const toneMatch = this.scoreToneMatch(content);

    // Complexity level
    const complexityLevel = this.scoreComplexityLevel(content);

    if (ageAppropriate < 70) issues.push('Language not appropriate for 45-75 demographic');
    if (toneMatch < 70) issues.push('Tone doesn\'t match conservative investor preferences');
    if (complexityLevel < 70) issues.push('Content complexity not optimal for audience');

    score = Math.round((ageAppropriate + toneMatch + complexityLevel) / 3);

    return {
      score,
      age_appropriate: ageAppropriate,
      tone_match: toneMatch,
      complexity_level: complexityLevel,
      issues
    };
  }

  private scoreAgeAppropriateness(content: string): number {
    const contentLower = content.toLowerCase();
    let score = 70;

    // Inappropriate for older demographic
    const youngTerms = [
      'yo', 'bro', 'dude', 'lit', 'fire', 'sick', 'bet', 'cap',
      'no cap', 'fr', 'periodt', 'slaps', 'hits different'
    ];

    const youngCount = youngTerms.filter(term => contentLower.includes(term)).length;
    score -= youngCount * 25;

    // Appropriate references
    const appropriateRefs = [
      'retirement', 'estate planning', 'legacy', 'grandchildren',
      'fixed income', 'social security', 'pension', '401k', 'ira'
    ];

    const refCount = appropriateRefs.filter(term => contentLower.includes(term)).length;
    score += refCount * 8;

    return Math.min(100, Math.max(0, score));
  }

  private scoreToneMatch(content: string): number {
    const contentLower = content.toLowerCase();
    let score = 60;

    // Conservative investor preferences
    const conservativeTerms = [
      'stability', 'security', 'preservation', 'steady', 'reliable',
      'time-tested', 'established', 'proven track record', 'conservative approach'
    ];

    const consCount = conservativeTerms.filter(term => contentLower.includes(term)).length;
    score += consCount * 10;

    // Risk-averse language
    const riskAverseTerms = [
      'careful consideration', 'prudent', 'cautious', 'measured approach',
      'due diligence', 'thoroughly evaluate'
    ];

    const riskCount = riskAverseTerms.filter(term => contentLower.includes(term)).length;
    score += riskCount * 8;

    return Math.min(100, Math.max(0, score));
  }

  private scoreComplexityLevel(content: string): number {
    const sentences = content.split('.').filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const avgWordsPerSentence = words.length / sentences.length;

    let score = 50;

    // Optimal complexity for 45-75 demographic
    if (avgWordsPerSentence >= 15 && avgWordsPerSentence <= 25) {
      score += 20; // Good complexity
    } else if (avgWordsPerSentence < 10) {
      score -= 15; // Too simple
    } else if (avgWordsPerSentence > 30) {
      score -= 20; // Too complex
    }

    // Technical jargon check
    const jargonTerms = [
      'derivative', 'quantitative easing', 'basis points', 'contango',
      'backwardation', 'volatility surface', 'correlation coefficient'
    ];

    const jargonCount = jargonTerms.filter(term => content.toLowerCase().includes(term)).length;
    if (jargonCount > 3) score -= 15; // Too technical

    return Math.min(100, Math.max(0, score));
  }

  private analyzeContentStructure(content: string) {
    let score = 50;
    const issues: string[] = [];

    // Information hierarchy
    const hierarchyScore = this.scoreInformationHierarchy(content);

    // Readability
    const readabilityScore = this.scoreReadability(content);

    // Educational flow
    const educationalFlowScore = this.scoreEducationalFlow(content);

    if (hierarchyScore < 70) issues.push('Poor information hierarchy - needs better structure');
    if (readabilityScore < 70) issues.push('Readability issues - too dense or poorly formatted');
    if (educationalFlowScore < 70) issues.push('Doesn\'t follow educational progression');

    score = Math.round((hierarchyScore + readabilityScore + educationalFlowScore) / 3);

    return {
      score,
      information_hierarchy: hierarchyScore,
      readability: readabilityScore,
      educational_flow: educationalFlowScore,
      issues
    };
  }

  private scoreInformationHierarchy(content: string): number {
    let score = 50;

    // Check for headers/structure
    const hasHeaders = content.includes('#') || content.includes('##');
    if (hasHeaders) score += 15;

    // Check for bullet points/lists
    const hasList = content.includes('•') || content.includes('-') || content.includes('*');
    if (hasList) score += 10;

    // Paragraph structure
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
    if (paragraphs.length >= 3) score += 10;

    // Opening statement
    const firstParagraph = paragraphs[0] || '';
    if (firstParagraph.length > 50 && firstParagraph.length < 200) score += 10;

    return Math.min(100, Math.max(0, score));
  }

  private scoreReadability(content: string): number {
    let score = 60;

    // Sentence length variation
    const sentences = content.split('.').filter(s => s.trim().length > 0);
    const sentenceLengths = sentences.map(s => s.length);
    const avgLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;

    if (avgLength > 50 && avgLength < 120) score += 15;

    // Paragraph length
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
    const avgParagraphLength = paragraphs.reduce((sum, p) => sum + p.length, 0) / paragraphs.length;

    if (avgParagraphLength < 500) score += 10; // Good for older readers

    // White space usage
    const whitespaceRatio = (content.match(/\s/g) || []).length / content.length;
    if (whitespaceRatio > 0.15 && whitespaceRatio < 0.25) score += 10;

    return Math.min(100, Math.max(0, score));
  }

  private scoreEducationalFlow(content: string): number {
    const contentLower = content.toLowerCase();
    let score = 50;

    // Educational progression indicators
    const progressionTerms = [
      'first', 'second', 'next', 'then', 'finally', 'to begin',
      'let\'s start', 'to understand', 'consider this', 'for example'
    ];

    const progressionCount = progressionTerms.filter(term => contentLower.includes(term)).length;
    score += progressionCount * 8;

    // Learning reinforcement
    const reinforcementTerms = [
      'remember', 'key point', 'important', 'takeaway',
      'in summary', 'to recap', 'this means'
    ];

    const reinforcementCount = reinforcementTerms.filter(term => contentLower.includes(term)).length;
    score += reinforcementCount * 10;

    return Math.min(100, Math.max(0, score));
  }

  private analyzeCompliance(content: string) {
    const contentLower = content.toLowerCase();
    let score = 50;
    const issues: string[] = [];

    // Required disclaimers
    const disclaimersPresent = this.checkDisclaimers(content);
    if (disclaimersPresent) score += 25;
    else issues.push('Missing required financial disclaimers');

    // Risk disclosures
    const riskDisclosures = this.checkRiskDisclosures(content);
    if (riskDisclosures) score += 20;
    else if (content.length > 500) issues.push('Needs risk disclosure statements');

    // Educational framing
    const educationalFraming = this.checkEducationalFraming(content);
    if (educationalFraming) score += 25;
    else issues.push('Content not properly framed as educational');

    return {
      score: Math.min(100, score),
      disclaimers_present: disclaimersPresent,
      risk_disclosures: riskDisclosures,
      educational_framing: educationalFraming,
      issues
    };
  }

  private checkDisclaimers(content: string): boolean {
    const contentLower = content.toLowerCase();
    const disclaimerTerms = [
      'not investment advice', 'not financial advice', 'consult',
      'educational purposes', 'past performance', 'no guarantee'
    ];

    return disclaimerTerms.some(term => contentLower.includes(term));
  }

  private checkRiskDisclosures(content: string): boolean {
    const contentLower = content.toLowerCase();
    const riskTerms = [
      'risk', 'may lose', 'no guarantee', 'past performance',
      'market volatility', 'fluctuate', 'consider your situation'
    ];

    return riskTerms.filter(term => contentLower.includes(term)).length >= 2;
  }

  private checkEducationalFraming(content: string): boolean {
    const contentLower = content.toLowerCase();
    const educationalTerms = [
      'understand', 'learn', 'education', 'knowledge', 'inform',
      'consider', 'evaluate', 'factors', 'important to know'
    ];

    return educationalTerms.filter(term => contentLower.includes(term)).length >= 3;
  }

  private analyzeSalesTactics(content: string) {
    const contentLower = content.toLowerCase();

    // Pressure tactics
    const pressureTactics = this.findPressureTactics(content);

    // Urgency language
    const urgencyLanguage = this.findUrgencyLanguage(content);

    // Aggressive terms
    const aggressiveTerms = this.findAggressiveTerms(content);

    // Trust vs push ratio
    const trustVsPushRatio = this.calculateTrustVsPushRatio(content);

    let score = 80; // Start high, deduct for violations
    score -= pressureTactics.length * 15;
    score -= urgencyLanguage.length * 10;
    score -= aggressiveTerms.length * 12;

    if (trustVsPushRatio < 1) score -= 20; // More push than trust

    return {
      score: Math.max(0, score),
      pressure_tactics: pressureTactics,
      urgency_language: urgencyLanguage,
      aggressive_terms: aggressiveTerms,
      trust_vs_push_ratio: trustVsPushRatio
    };
  }

  private findPressureTactics(content: string): string[] {
    const contentLower = content.toLowerCase();
    const pressureTerms = [
      'act now', 'don\'t wait', 'last chance', 'limited spots',
      'only today', 'expires soon', 'while supplies last',
      'don\'t miss out', 'you must', 'you should'
    ];

    return pressureTerms.filter(term => contentLower.includes(term));
  }

  private findUrgencyLanguage(content: string): string[] {
    const contentLower = content.toLowerCase();
    const urgencyTerms = [
      'urgent', 'immediately', 'right now', 'today only',
      'hurry', 'fast', 'quick', 'instant', 'emergency'
    ];

    return urgencyTerms.filter(term => contentLower.includes(term));
  }

  private findAggressiveTerms(content: string): string[] {
    const contentLower = content.toLowerCase();
    const aggressiveTerms = [
      'guaranteed returns', 'risk-free', 'can\'t lose', 'sure thing',
      'explosive growth', 'get rich', 'fortune', 'wealth beyond'
    ];

    return aggressiveTerms.filter(term => contentLower.includes(term));
  }

  private calculateTrustVsPushRatio(content: string): number {
    const contentLower = content.toLowerCase();

    const trustTerms = [
      'trust', 'reliable', 'honest', 'transparent', 'education',
      'understand', 'learn', 'consider', 'evaluate'
    ];

    const pushTerms = [
      'buy', 'purchase', 'order', 'call now', 'get', 'grab',
      'don\'t miss', 'act now', 'limited time'
    ];

    const trustCount = trustTerms.filter(term => contentLower.includes(term)).length;
    const pushCount = pushTerms.filter(term => contentLower.includes(term)).length;

    return pushCount === 0 ? trustCount : trustCount / pushCount;
  }

  private calculateOverallScore(analyses: any): number {
    const weights = {
      brandVoice: 0.3,
      audience: 0.2,
      structure: 0.15,
      compliance: 0.25,
      salesTactics: 0.1
    };

    return Math.round(
      analyses.brandVoiceAnalysis.score * weights.brandVoice +
      analyses.audienceAnalysis.score * weights.audience +
      analyses.structureAnalysis.score * weights.structure +
      analyses.complianceAnalysis.score * weights.compliance +
      analyses.salesTacticsAnalysis.score * weights.salesTactics
    );
  }

  private determineComplianceStatus(score: number): 'PASSED' | 'NEEDS_IMPROVEMENT' | 'FAILED' {
    if (score >= 80) return 'PASSED';
    if (score >= 60) return 'NEEDS_IMPROVEMENT';
    return 'FAILED';
  }

  private determineRedesignPriority(score: number, complianceAnalysis: any): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (score < 40) return 'CRITICAL';
    if (score < 60) return 'HIGH';
    if (score < 75 || !complianceAnalysis.disclaimers_present) return 'MEDIUM';
    return 'LOW';
  }

  private generateRecommendations(analyses: any) {
    const immediateFixes: string[] = [];
    const structuralChanges: string[] = [];
    const voiceAdjustments: string[] = [];
    const complianceAdditions: string[] = [];

    // Brand voice recommendations
    if (analyses.brandVoiceAnalysis.knowledgeable_authoritative < 70) {
      voiceAdjustments.push('Add more data, historical context, and authoritative sources');
    }
    if (analyses.brandVoiceAnalysis.trustworthy_transparent < 70) {
      voiceAdjustments.push('Include more transparency about risks and processes');
    }
    if (analyses.brandVoiceAnalysis.protective_strategic < 70) {
      voiceAdjustments.push('Shift from sales-focused to protective, educational tone');
    }

    // Compliance recommendations
    if (!analyses.complianceAnalysis.disclaimers_present) {
      complianceAdditions.push('Add required financial disclaimers');
    }
    if (!analyses.complianceAnalysis.risk_disclosures) {
      complianceAdditions.push('Include risk disclosure statements');
    }
    if (!analyses.complianceAnalysis.educational_framing) {
      complianceAdditions.push('Reframe content as educational rather than promotional');
    }

    // Structure recommendations
    if (analyses.structureAnalysis.information_hierarchy < 70) {
      structuralChanges.push('Improve content structure with headers and logical flow');
    }
    if (analyses.structureAnalysis.readability < 70) {
      structuralChanges.push('Break up dense text with bullet points and shorter paragraphs');
    }

    // Sales tactics
    if (analyses.salesTacticsAnalysis.pressure_tactics.length > 0) {
      immediateFixes.push('Remove pressure tactics and urgency language');
    }
    if (analyses.salesTacticsAnalysis.trust_vs_push_ratio < 1) {
      immediateFixes.push('Increase educational content relative to sales messaging');
    }

    return {
      immediate_fixes: immediateFixes,
      structural_changes: structuralChanges,
      voice_adjustments: voiceAdjustments,
      compliance_additions: complianceAdditions
    };
  }
}
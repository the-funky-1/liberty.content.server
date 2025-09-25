import { ContentAuditor, ContentAudit } from './content-auditor.js';
import { BrandVoiceEngine } from '../framework/brand-voice.js';
import { ContentGenerator } from './content-generator.js';
import { LIBERTY_FRAMEWORK } from '../types/index.js';

export interface RedesignRequest {
  original_content: string;
  content_type?: string;
  target_audience?: string;
  preserve_key_information?: boolean;
  redesign_intensity?: 'light' | 'moderate' | 'complete';
  specific_requirements?: string[];
}

export interface RedesignResult {
  redesigned_content: string;
  transformation_summary: {
    changes_made: string[];
    improvements: string[];
    preserved_elements: string[];
  };
  before_after_comparison: {
    original_audit: ContentAudit;
    redesigned_audit: ContentAudit;
    improvement_metrics: {
      overall_score_change: number;
      brand_voice_improvement: number;
      compliance_improvement: number;
      audience_alignment_improvement: number;
    };
  };
  final_compliance_status: 'PASSED' | 'NEEDS_IMPROVEMENT' | 'FAILED';
  seo_metadata?: {
    title: string;
    meta_description: string;
    h1: string;
    keywords: string[];
  };
}

export class ContentRedesigner {
  private auditor: ContentAuditor;
  private contentGenerator: ContentGenerator;

  constructor() {
    this.auditor = new ContentAuditor();
    this.contentGenerator = new ContentGenerator();
  }

  async redesignContent(request: RedesignRequest): Promise<RedesignResult> {
    // Step 1: Audit the original content
    const originalAudit = this.auditor.auditContent(request.original_content, request.content_type);

    // Step 2: Extract key information to preserve
    const keyInformation = request.preserve_key_information !== false
      ? this.extractKeyInformation(request.original_content)
      : null;

    // Step 3: Perform the redesign based on intensity level
    const redesignedContent = await this.performRedesign(
      request.original_content,
      originalAudit,
      request,
      keyInformation
    );

    // Step 4: Audit the redesigned content
    const redesignedAudit = this.auditor.auditContent(redesignedContent, request.content_type);

    // Step 5: Generate transformation summary
    const transformationSummary = this.generateTransformationSummary(
      request.original_content,
      redesignedContent,
      originalAudit,
      redesignedAudit
    );

    // Step 6: Calculate improvements
    const improvementMetrics = this.calculateImprovements(originalAudit, redesignedAudit);

    // Step 7: Generate SEO metadata if needed
    const seoMetadata = request.content_type && ['webpage', 'landing_page', 'blog'].includes(request.content_type)
      ? await this.generateSEOMetadata(redesignedContent)
      : undefined;

    return {
      redesigned_content: redesignedContent,
      transformation_summary: transformationSummary,
      before_after_comparison: {
        original_audit: originalAudit,
        redesigned_audit: redesignedAudit,
        improvement_metrics: improvementMetrics
      },
      final_compliance_status: redesignedAudit.compliance_status,
      seo_metadata: seoMetadata
    };
  }

  private extractKeyInformation(content: string): {
    facts: string[];
    statistics: string[];
    key_concepts: string[];
    company_specific: string[];
  } {
    const contentLower = content.toLowerCase();

    // Extract facts and data points
    const facts = this.extractFacts(content);

    // Extract statistics
    const statistics = this.extractStatistics(content);

    // Extract key concepts
    const keyConcepts = this.extractKeyConcepts(content);

    // Extract company-specific information
    const companySpecific = this.extractCompanySpecific(content);

    return {
      facts,
      statistics,
      key_concepts: keyConcepts,
      company_specific: companySpecific
    };
  }

  private extractFacts(content: string): string[] {
    const facts: string[] = [];

    // Extract sentences with factual indicators
    const sentences = content.split('.').map(s => s.trim()).filter(s => s.length > 0);

    const factualIndicators = [
      'according to', 'data shows', 'research indicates', 'studies show',
      'history shows', 'since 1971', 'federal reserve', 'treasury',
      'was established', 'has been', 'is regulated by'
    ];

    for (const sentence of sentences) {
      if (factualIndicators.some(indicator => sentence.toLowerCase().includes(indicator))) {
        facts.push(sentence.trim());
      }
    }

    return facts.slice(0, 10); // Limit to most important facts
  }

  private extractStatistics(content: string): string[] {
    const statistics: string[] = [];

    // Find sentences with numbers, percentages, dates
    const sentences = content.split('.').map(s => s.trim()).filter(s => s.length > 0);

    for (const sentence of sentences) {
      if (sentence.match(/\d+%|\$\d+|\d{4}|\d+\.\d+/)) {
        statistics.push(sentence.trim());
      }
    }

    return statistics.slice(0, 8);
  }

  private extractKeyConcepts(content: string): string[] {
    const concepts: string[] = [];
    const contentLower = content.toLowerCase();

    const importantConcepts = [
      'gold ira', 'precious metals', 'portfolio diversification', 'inflation hedge',
      'wealth preservation', 'economic uncertainty', 'store of value',
      'physical possession', 'tax advantages', 'retirement planning'
    ];

    for (const concept of importantConcepts) {
      if (contentLower.includes(concept)) {
        concepts.push(concept);
      }
    }

    return concepts;
  }

  private extractCompanySpecific(content: string): string[] {
    const companyInfo: string[] = [];
    const sentences = content.split('.').map(s => s.trim()).filter(s => s.length > 0);

    // Look for company-specific information
    const companyIndicators = [
      'our process', 'we provide', 'our team', 'our approach',
      'we believe', 'our mission', 'liberty gold silver'
    ];

    for (const sentence of sentences) {
      if (companyIndicators.some(indicator => sentence.toLowerCase().includes(indicator))) {
        companyInfo.push(sentence.trim());
      }
    }

    return companyInfo.slice(0, 5);
  }

  private async performRedesign(
    originalContent: string,
    audit: ContentAudit,
    request: RedesignRequest,
    keyInfo: any
  ): Promise<string> {
    const intensity = request.redesign_intensity || 'moderate';

    switch (intensity) {
      case 'light':
        return this.performLightRedesign(originalContent, audit, keyInfo);
      case 'moderate':
        return this.performModerateRedesign(originalContent, audit, request, keyInfo);
      case 'complete':
        return this.performCompleteRedesign(originalContent, audit, request, keyInfo);
      default:
        return this.performModerateRedesign(originalContent, audit, request, keyInfo);
    }
  }

  private performLightRedesign(originalContent: string, audit: ContentAudit, keyInfo: any): string {
    let content = originalContent;

    // Light touch - just fix compliance and obvious brand voice issues

    // Remove aggressive sales language
    for (const term of audit.detailed_analysis.sales_tactics.aggressive_terms) {
      const replacement = this.getAggressiveTermReplacement(term);
      content = content.replace(new RegExp(term, 'gi'), replacement);
    }

    // Remove pressure tactics
    for (const tactic of audit.detailed_analysis.sales_tactics.pressure_tactics) {
      content = content.replace(new RegExp(tactic, 'gi'), '');
    }

    // Add disclaimers if missing
    if (!audit.detailed_analysis.compliance_requirements.disclaimers_present) {
      content += this.getAppropriateDisclaimer(content);
    }

    // Clean up extra whitespace
    content = content.replace(/\s+/g, ' ').replace(/\n\s*\n\s*\n/g, '\n\n').trim();

    return content;
  }

  private performModerateRedesign(
    originalContent: string,
    audit: ContentAudit,
    request: RedesignRequest,
    keyInfo: any
  ): string {
    // Start with structure improvements
    let content = this.improveContentStructure(originalContent, keyInfo);

    // Transform brand voice
    content = this.transformBrandVoice(content, audit);

    // Improve audience alignment
    content = this.improveAudienceAlignment(content, request.target_audience);

    // Ensure compliance
    content = this.ensureCompliance(content, audit);

    // Preserve key information
    if (keyInfo) {
      content = this.weaveInKeyInformation(content, keyInfo);
    }

    return content.trim();
  }

  private async performCompleteRedesign(
    originalContent: string,
    audit: ContentAudit,
    request: RedesignRequest,
    keyInfo: any
  ): Promise<string> {
    // Extract the core topic/theme
    const coreTheme = this.extractCoreTheme(originalContent);

    // Generate completely new content using the framework
    const newContentRequest = {
      content_type: (request.content_type || 'blog') as any,
      topic: coreTheme,
      target_audience: request.target_audience as any || 'security_seekers',
      length_target: this.determineLength(originalContent) as any,
      include_cta: originalContent.toLowerCase().includes('call') || originalContent.toLowerCase().includes('contact')
    };

    const generatedResult = await this.contentGenerator.generateContent(newContentRequest);
    let newContent = generatedResult.content;

    // Weave in preserved key information
    if (keyInfo) {
      newContent = this.weaveInKeyInformation(newContent, keyInfo);
    }

    return newContent;
  }

  private improveContentStructure(content: string, keyInfo: any): string {
    let improved = content;

    // Add headers if missing
    const paragraphs = improved.split('\n\n').filter(p => p.trim().length > 0);

    if (paragraphs.length > 3 && !improved.includes('#')) {
      // Add a main header
      const title = this.generateTitle(content);
      improved = `# ${title}\n\n${improved}`;

      // Add section headers for long paragraphs
      if (paragraphs.length > 5) {
        const sections = this.identifySections(paragraphs);
        improved = this.addSectionHeaders(improved, sections);
      }
    }

    // Break up long paragraphs
    improved = this.breakUpLongParagraphs(improved);

    // Add bullet points for lists
    improved = this.convertToLists(improved);

    return improved;
  }

  private transformBrandVoice(content: string, audit: ContentAudit): string {
    let transformed = content;

    // Apply brand voice transformation
    transformed = BrandVoiceEngine.applyBrandVoiceTransformation(transformed);

    // Enhance authoritativeness
    if (audit.detailed_analysis.brand_voice.knowledgeable_authoritative < 70) {
      transformed = this.enhanceAuthoritativeness(transformed);
    }

    // Improve trustworthiness
    if (audit.detailed_analysis.brand_voice.trustworthy_transparent < 70) {
      transformed = this.improveTrustworthiness(transformed);
    }

    // Increase protectiveness
    if (audit.detailed_analysis.brand_voice.protective_strategic < 70) {
      transformed = this.increaseProtectiveness(transformed);
    }

    return transformed;
  }

  private improveAudienceAlignment(content: string, targetAudience?: string): string {
    let aligned = content;

    // Get persona guidance
    const persona = targetAudience || 'security_seekers';
    const guidance = BrandVoiceEngine.getPersonaGuidance(persona);

    // Apply persona-specific language adjustments
    aligned = this.applyPersonaLanguage(aligned, guidance);

    // Adjust complexity for 45-75 demographic
    aligned = this.adjustComplexity(aligned);

    // Remove inappropriate language
    aligned = this.removeInappropriateLanguage(aligned);

    return aligned;
  }

  private ensureCompliance(content: string, audit: ContentAudit): string {
    let compliant = content;

    // Add disclaimers if missing
    if (!audit.detailed_analysis.compliance_requirements.disclaimers_present) {
      compliant += this.getAppropriateDisclaimer(compliant);
    }

    // Add risk disclosures if needed
    if (!audit.detailed_analysis.compliance_requirements.risk_disclosures) {
      compliant = this.addRiskDisclosures(compliant);
    }

    // Ensure educational framing
    if (!audit.detailed_analysis.compliance_requirements.educational_framing) {
      compliant = this.addEducationalFraming(compliant);
    }

    return compliant;
  }

  private weaveInKeyInformation(content: string, keyInfo: any): string {
    let enhanced = content;

    // Weave in statistics naturally
    for (const stat of keyInfo.statistics.slice(0, 3)) {
      if (!enhanced.includes(stat)) {
        enhanced = this.insertStatistic(enhanced, stat);
      }
    }

    // Weave in key facts
    for (const fact of keyInfo.facts.slice(0, 2)) {
      if (!enhanced.includes(fact)) {
        enhanced = this.insertFact(enhanced, fact);
      }
    }

    return enhanced;
  }

  // Helper methods for transformations
  private getAggressiveTermReplacement(term: string): string {
    const replacements: Record<string, string> = {
      'guaranteed returns': 'potential for appreciation',
      'risk-free': 'traditionally stable',
      'get rich': 'build wealth',
      'explosive growth': 'potential appreciation',
      'fortune': 'financial security'
    };

    return replacements[term.toLowerCase()] || 'potential benefits';
  }

  private getAppropriateDisclaimer(content: string): string {
    if (content.toLowerCase().includes('invest') || content.toLowerCase().includes('portfolio')) {
      return `\n\n**Important Disclosure**: This information is for educational purposes only and is not intended as investment advice. Past performance does not guarantee future results. Please consult with a precious metals specialist to discuss your specific situation and investment objectives.`;
    }

    return `\n\n**Educational Disclaimer**: The information provided is for educational purposes only. Liberty Gold Silver specializes in precious metals, not general financial advice. Please consult appropriate professionals for personalized guidance.`;
  }

  private generateTitle(content: string): string {
    const firstSentence = content.split('.')[0]?.trim() || '';

    // Generate title based on content themes
    if (content.toLowerCase().includes('gold ira')) {
      return 'Understanding Gold IRAs: A Guide for Informed Investors';
    } else if (content.toLowerCase().includes('silver')) {
      return 'Silver Investing: Educational Insights for Portfolio Diversification';
    } else if (content.toLowerCase().includes('precious metals')) {
      return 'Precious Metals Education: Building Knowledge for Informed Decisions';
    }

    return 'Educational Guide: Understanding Precious Metals Investing';
  }

  private extractCoreTheme(content: string): string {
    const contentLower = content.toLowerCase();

    if (contentLower.includes('gold ira')) return 'Gold IRA benefits and considerations';
    if (contentLower.includes('silver investing')) return 'Silver investment fundamentals';
    if (contentLower.includes('inflation')) return 'Precious metals as inflation hedge';
    if (contentLower.includes('retirement')) return 'Precious metals in retirement planning';

    return 'Precious metals investment education';
  }

  private determineLength(content: string): string {
    const wordCount = content.split(/\s+/).length;

    if (wordCount < 300) return 'short';
    if (wordCount < 800) return 'medium';
    return 'long';
  }

  private enhanceAuthoritativeness(content: string): string {
    // Add authoritative language patterns
    return content
      .replace(/I think/gi, 'Research indicates')
      .replace(/It seems/gi, 'Analysis shows')
      .replace(/Maybe/gi, 'Evidence suggests');
  }

  private improveTrustworthiness(content: string): string {
    // Add transparency and honesty markers
    let improved = content;

    if (!improved.toLowerCase().includes('risk')) {
      improved += ' It\'s important to understand that all investments carry risk and require careful consideration.';
    }

    return improved;
  }

  private increaseProtectiveness(content: string): string {
    // Replace sales language with protective language
    return content
      .replace(/buy now/gi, 'consider the benefits of')
      .replace(/purchase/gi, 'explore')
      .replace(/get yours/gi, 'understand the value of');
  }

  // Additional helper methods...
  private breakUpLongParagraphs(content: string): string {
    return content.replace(/([.!?])\s+([A-Z])/g, '$1\n\n$2');
  }

  private convertToLists(content: string): string {
    // Convert comma-separated items to bullet points
    return content.replace(
      /([^.]+)(benefits|advantages|factors|considerations|reasons)([^.]+:)\s*([^.]+,\s*[^.]+,\s*[^.]+)/gi,
      '$1$2$3\n• $4'.replace(/,\s*/g, '\n• ')
    );
  }

  private identifySections(paragraphs: string[]): string[] {
    // Basic section identification logic
    const sections = [];
    if (paragraphs.length > 0) sections.push('Introduction');
    if (paragraphs.length > 2) sections.push('Key Benefits');
    if (paragraphs.length > 4) sections.push('Important Considerations');
    if (paragraphs.length > 6) sections.push('Next Steps');

    return sections;
  }

  private addSectionHeaders(content: string, sections: string[]): string {
    // Simple implementation - in production, this would be more sophisticated
    const paragraphs = content.split('\n\n');
    let result = '';

    for (let i = 0; i < paragraphs.length; i++) {
      if (i > 0 && i < sections.length + 1) {
        result += `\n\n## ${sections[i - 1]}\n\n`;
      }
      result += paragraphs[i];
      if (i < paragraphs.length - 1) result += '\n\n';
    }

    return result;
  }

  private applyPersonaLanguage(content: string, guidance: any): string {
    // Apply persona-specific language adjustments based on guidance
    let adjusted = content;

    // This would be expanded based on specific persona needs
    if (guidance.persona === 'Security Seekers') {
      adjusted = adjusted.replace(/growth/gi, 'stability and growth');
      adjusted = adjusted.replace(/opportunity/gi, 'secure opportunity');
    }

    return adjusted;
  }

  private adjustComplexity(content: string): string {
    // Adjust for 45-75 demographic
    return content
      .replace(/utilize/gi, 'use')
      .replace(/facilitate/gi, 'help')
      .replace(/subsequently/gi, 'then');
  }

  private removeInappropriateLanguage(content: string): string {
    const inappropriateTerms = ['yo', 'bro', 'lit', 'fire', 'sick'];
    let cleaned = content;

    for (const term of inappropriateTerms) {
      cleaned = cleaned.replace(new RegExp(term, 'gi'), '');
    }

    return cleaned;
  }

  private addRiskDisclosures(content: string): string {
    if (!content.toLowerCase().includes('risk')) {
      return content + ' Please remember that all investments involve risk and past performance does not guarantee future results.';
    }
    return content;
  }

  private addEducationalFraming(content: string): string {
    if (!content.toLowerCase().includes('understand') && !content.toLowerCase().includes('education')) {
      return `Understanding the fundamentals is crucial for informed decision-making. ${content}`;
    }
    return content;
  }

  private insertStatistic(content: string, stat: string): string {
    const sentences = content.split('.');
    if (sentences.length > 2) {
      sentences.splice(2, 0, ` ${stat}`);
      return sentences.join('.');
    }
    return content + ` ${stat}`;
  }

  private insertFact(content: string, fact: string): string {
    const paragraphs = content.split('\n\n');
    if (paragraphs.length > 1) {
      paragraphs.splice(1, 0, fact);
      return paragraphs.join('\n\n');
    }
    return content + `\n\n${fact}`;
  }

  private generateTransformationSummary(
    original: string,
    redesigned: string,
    originalAudit: ContentAudit,
    redesignedAudit: ContentAudit
  ) {
    const changesMade: string[] = [];
    const improvements: string[] = [];
    const preservedElements: string[] = [];

    // Analyze changes made
    if (redesigned.includes('#') && !original.includes('#')) {
      changesMade.push('Added structured headers and sections');
    }

    if (redesignedAudit.detailed_analysis.compliance_requirements.disclaimers_present &&
        !originalAudit.detailed_analysis.compliance_requirements.disclaimers_present) {
      changesMade.push('Added required financial disclaimers');
    }

    if (originalAudit.detailed_analysis.sales_tactics.aggressive_terms.length >
        redesignedAudit.detailed_analysis.sales_tactics.aggressive_terms.length) {
      changesMade.push('Removed aggressive sales language');
    }

    // Document improvements
    if (redesignedAudit.detailed_analysis.brand_voice.score > originalAudit.detailed_analysis.brand_voice.score) {
      improvements.push(`Improved brand voice compliance by ${redesignedAudit.detailed_analysis.brand_voice.score - originalAudit.detailed_analysis.brand_voice.score} points`);
    }

    if (redesignedAudit.compliance_status !== 'FAILED' && originalAudit.compliance_status === 'FAILED') {
      improvements.push('Achieved compliance with Liberty Gold Silver framework');
    }

    // Document preserved elements
    preservedElements.push('Core educational message and key facts');
    preservedElements.push('Specific data points and statistics');

    return {
      changes_made: changesMade,
      improvements: improvements,
      preserved_elements: preservedElements
    };
  }

  private calculateImprovements(originalAudit: ContentAudit, redesignedAudit: ContentAudit) {
    return {
      overall_score_change: redesignedAudit.overall_score - originalAudit.overall_score,
      brand_voice_improvement: redesignedAudit.detailed_analysis.brand_voice.score - originalAudit.detailed_analysis.brand_voice.score,
      compliance_improvement: redesignedAudit.detailed_analysis.compliance_requirements.score - originalAudit.detailed_analysis.compliance_requirements.score,
      audience_alignment_improvement: redesignedAudit.detailed_analysis.audience_alignment.score - originalAudit.detailed_analysis.audience_alignment.score
    };
  }

  private async generateSEOMetadata(content: string) {
    // Basic SEO metadata generation
    const title = content.split('\n')[0]?.replace('#', '').trim() || 'Educational Guide';
    const firstParagraph = content.split('\n\n')[1] || content.slice(0, 150);

    return {
      title: title.slice(0, 60),
      meta_description: firstParagraph.slice(0, 155) + (firstParagraph.length > 155 ? '...' : ''),
      h1: title,
      keywords: ['precious metals', 'gold ira', 'silver investing', 'wealth preservation', 'education']
    };
  }
}
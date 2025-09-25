import { ContentRequest, ContentOutput } from '../types/index.js';
import { BrandVoiceEngine } from '../framework/brand-voice.js';

export class ContentGenerator {

  async generateContent(request: ContentRequest): Promise<ContentOutput> {
    // Transform request through brand voice filter
    const transformedTopic = BrandVoiceEngine.applyBrandVoiceTransformation(request.topic);

    // Get persona guidance if specified
    const personaGuidance = request.target_audience !== 'auto_detect'
      ? BrandVoiceEngine.getPersonaGuidance(request.target_audience || 'security_seekers')
      : null;

    // Three-pass content generation
    const pass1Content = await this.generatePass1Framework(transformedTopic, request, personaGuidance);
    const pass2Content = await this.generatePass2Engagement(pass1Content, request);
    const finalContent = await this.generatePass3Technical(pass2Content, request);

    // Generate SEO metadata
    const seoMetadata = await this.generateSEOMetadata(finalContent, request);

    // Validate brand compliance
    const complianceStatus = BrandVoiceEngine.validateBrandCompliance(finalContent);

    return {
      content: finalContent,
      seo_metadata: seoMetadata,
      compliance_status: {
        brand_voice_score: complianceStatus.score,
        disclaimers_included: complianceStatus.disclaimers_included,
        issues: complianceStatus.issues
      },
      refinement_passes: {
        pass_1_framework: pass1Content,
        pass_2_engagement: pass2Content,
        pass_3_technical: finalContent
      }
    };
  }

  private async generatePass1Framework(
    topic: string,
    request: ContentRequest,
    personaGuidance: any
  ): Promise<string> {
    const frameworkPrompt = this.buildFrameworkPrompt(topic, request, personaGuidance);

    // This would integrate with OpenAI or another LLM
    // For now, return a template-based approach
    return this.generateTemplateContent(topic, request, personaGuidance, 'framework');
  }

  private async generatePass2Engagement(content: string, request: ContentRequest): Promise<string> {
    // Pass 2: Enhance engagement and human-like flow
    const engagementPrompt = `
    Improve this content for better engagement while maintaining the Liberty Gold Silver brand voice:

    Requirements:
    - Make it more conversational and engaging for 45-75 year old audience
    - Add historical examples and analogies
    - Improve flow and readability
    - Maintain educational tone
    - Keep "Trust Through Education" philosophy

    Content to improve:
    ${content}
    `;

    return this.generateTemplateContent(content, request, null, 'engagement');
  }

  private async generatePass3Technical(content: string, request: ContentRequest): Promise<string> {
    // Pass 3: Technical polish, SEO optimization, final formatting
    const technicalPrompt = `
    Apply final technical polish to this content:

    Requirements:
    - Optimize for SEO and readability
    - Add proper disclaimers for financial content
    - Format for ${request.content_type}
    - Ensure grammar and spelling perfection
    - Add appropriate headers and structure

    Content to polish:
    ${content}
    `;

    const polishedContent = this.generateTemplateContent(content, request, null, 'technical');

    // Add required disclaimers
    return this.addRequiredDisclaimers(polishedContent, request);
  }

  private buildFrameworkPrompt(topic: string, request: ContentRequest, personaGuidance: any): string {
    let prompt = `
    Create ${request.content_type} content about ${topic} following the Liberty Gold Silver "Trust Through Education" framework:

    Brand Voice Requirements:
    - Knowledgeable & Authoritative: Use evidence, data, historical context
    - Trustworthy & Transparent: Honest about processes and risks
    - Professional & Established: Timeless tone, avoid trends
    - Protective & Strategic: "We don't push. We protect" mindset

    Content Structure: Use ${this.getContentStructure(request.content_type)}
    Length Target: ${request.length_target || 'medium'}
    `;

    if (personaGuidance) {
      prompt += `
      Target Audience: ${personaGuidance.persona}
      Focus Areas: ${personaGuidance.messaging_focus}
      Address Pain Points: ${personaGuidance.pain_points.join(', ')}
      Value Propositions: ${personaGuidance.value_propositions.join(', ')}
      `;
    }

    if (request.include_cta) {
      prompt += `
      Include Educational CTAs: "Get Your Free Guide", "Schedule A Consultation", "Learn More"
      `;
    }

    return prompt;
  }

  private getContentStructure(contentType: string): string {
    const structures = {
      email: 'Inverted pyramid - critical information first',
      webpage: 'Thesis-antithesis-synthesis structure',
      landing_page: 'Problem-solution with trust signals',
      blog: 'Narrative design with historical context',
      market_update: 'Data-driven analysis with educational context'
    };

    return structures[contentType as keyof typeof structures] || structures.blog;
  }

  private generateTemplateContent(
    topic: string,
    request: ContentRequest,
    personaGuidance: any,
    pass: 'framework' | 'engagement' | 'technical'
  ): string {
    // Template-based content generation for demonstration
    // In production, this would call OpenAI API or similar LLM

    const baseContent = this.getBaseTemplate(request.content_type, topic);

    if (pass === 'framework') {
      return baseContent;
    } else if (pass === 'engagement') {
      return this.enhanceEngagement(baseContent);
    } else {
      return this.applyTechnicalPolish(baseContent);
    }
  }

  private getBaseTemplate(contentType: string, topic: string): string {
    const templates = {
      blog: `# Understanding ${topic}: A Guide for Informed Investors

The world of precious metals investing can seem complex, but understanding ${topic} is essential for anyone considering portfolio diversification. Let's explore this topic through the lens of historical context and practical application.

## Historical Perspective

Throughout history, precious metals have served as a store of value during economic uncertainty...

## Current Market Analysis

Today's market conditions present unique considerations for investors evaluating ${topic}...

## Educational Takeaways

For investors seeking to understand ${topic}, several key factors deserve consideration:

- Historical performance data
- Market fundamentals
- Economic factors
- Portfolio allocation principles

## Next Steps

Understanding ${topic} is just the beginning of your educational journey in precious metals investing.`,

      email: `Subject: Understanding ${topic} - Educational Insights for Investors

Dear Valued Investor,

As economic conditions continue to evolve, many investors are seeking to understand ${topic} and its role in a diversified portfolio.

Today, I'd like to share some educational insights that can help you make more informed decisions...

Key considerations include:
- Historical context and performance
- Current market dynamics
- Portfolio allocation principles

If you'd like to learn more about ${topic}, I invite you to download our free educational guide.

Best regards,
The Liberty Gold Silver Team`,

      landing_page: `# ${topic}: Your Guide to Informed Precious Metals Investing

Are you seeking to understand ${topic} and its potential role in your investment portfolio? You've come to the right place for unbiased, educational information.

## Why Understanding ${topic} Matters

In today's economic climate, informed investors are exploring all options for portfolio diversification and wealth preservation...

## What You'll Learn

Our comprehensive educational approach covers:
- Historical analysis and precedent
- Current market considerations
- Portfolio integration strategies
- Risk assessment frameworks

## Get Your Free Educational Guide

Download our comprehensive guide to understanding ${topic} and precious metals investing.`,

      market_update: `# Market Update: ${topic} Analysis

## Current Market Conditions

Recent market data shows interesting developments regarding ${topic}. Let's examine these trends through an educational lens.

## Key Data Points

- Current pricing trends
- Volume analysis
- Historical comparison
- Economic factors

## Educational Analysis

For investors seeking to understand these market movements, several factors warrant consideration...

## Takeaway for Investors

Understanding ${topic} in the current market context requires careful analysis of multiple factors...`,

      webpage: `# ${topic}: Educational Resource for Precious Metals Investors

Welcome to our comprehensive educational resource on ${topic}. Our mission is simple: provide you with the knowledge needed to make informed decisions about precious metals investing.

## Understanding the Fundamentals

${topic} represents an important concept in precious metals investing. To truly understand its implications, we need to examine both historical context and current market realities.

## Historical Analysis

Throughout economic history, precious metals have played a crucial role in wealth preservation...

## Current Market Perspective

Today's investment landscape presents unique considerations for those evaluating ${topic}...

## Educational Resources

We believe in empowering investors through education. That's why we provide comprehensive resources to help you understand ${topic} and its place in modern portfolio management.`
    };

    return templates[contentType as keyof typeof templates] || templates.blog;
  }

  private enhanceEngagement(content: string): string {
    // Add engaging elements while maintaining brand voice
    return content
      .replace(/Throughout history,/g, 'Think of it this way: throughout history,')
      .replace(/Consider this:/g, 'Here\'s something worth considering:')
      .replace(/It\'s important to/g, 'What\'s particularly important is to');
  }

  private applyTechnicalPolish(content: string): string {
    // Apply final formatting and structure improvements
    return content
      .replace(/\n\n/g, '\n\n')
      .trim();
  }

  private addRequiredDisclaimers(content: string, request: ContentRequest): string {
    const disclaimers = {
      investment: `

**Important Disclosure**: This information is for educational purposes only and is not intended as investment advice. Past performance does not guarantee future results. Please consult with a precious metals specialist to discuss your specific situation and investment objectives.`,

      general: `

**Educational Disclaimer**: The information provided is for educational purposes only. Liberty Gold Silver specializes in precious metals, not general financial advice. Please consult appropriate professionals for personalized guidance.`
    };

    // Add appropriate disclaimer based on content type
    const disclaimer = content.toLowerCase().includes('invest') ||
                     content.toLowerCase().includes('portfolio') ||
                     content.toLowerCase().includes('return')
      ? disclaimers.investment
      : disclaimers.general;

    return content + disclaimer;
  }

  private async generateSEOMetadata(content: string, request: ContentRequest) {
    // Extract key information for SEO metadata
    const lines = content.split('\n');
    const title = lines.find(line => line.startsWith('#'))?.replace('#', '').trim() ||
                 `${request.topic} - Liberty Gold Silver Educational Guide`;

    const metaDescription = this.extractMetaDescription(content, request);
    const keywords = this.extractKeywords(content, request);
    const h2Suggestions = this.extractH2Suggestions(content);

    return {
      title: title.slice(0, 60), // SEO title length limit
      meta_description: metaDescription,
      h1: title,
      h2_suggestions: h2Suggestions,
      keywords: keywords,
      schema_markup: this.generateSchemaMarkup(title, metaDescription, request)
    };
  }

  private extractMetaDescription(content: string, request: ContentRequest): string {
    // Extract first meaningful paragraph for meta description
    const sentences = content.split('.').filter(s => s.length > 50);
    let description = sentences[0]?.trim() || '';

    // Ensure it fits meta description length limits
    if (description.length > 155) {
      description = description.slice(0, 152) + '...';
    }

    return description;
  }

  private extractKeywords(content: string, request: ContentRequest): string[] {
    const commonKeywords = [
      'gold ira', 'precious metals', 'silver investing', 'wealth preservation',
      'portfolio diversification', 'economic uncertainty', 'inflation hedge'
    ];

    // Add topic-specific keywords
    const topicKeywords = request.topic.toLowerCase().split(' ');

    return [...new Set([...commonKeywords, ...topicKeywords])].slice(0, 10);
  }

  private extractH2Suggestions(content: string): string[] {
    const lines = content.split('\n');
    return lines
      .filter(line => line.startsWith('##'))
      .map(line => line.replace('##', '').trim())
      .slice(0, 5);
  }

  private generateSchemaMarkup(title: string, description: string, request: ContentRequest) {
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": title,
      "description": description,
      "author": {
        "@type": "Organization",
        "name": "Liberty Gold Silver"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Liberty Gold Silver"
      },
      "datePublished": new Date().toISOString(),
      "articleSection": "Precious Metals Education"
    };
  }
}
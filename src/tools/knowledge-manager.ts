import { KnowledgeSource } from '../types/index.js';
import { INITIAL_APMEX_SOURCES } from '../knowledge/initial-sources.js';
import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';

export class KnowledgeManager {
  private knowledgeBase: KnowledgeSource[] = [];
  private knowledgeFilePath: string;

  constructor() {
    this.knowledgeFilePath = path.join(process.cwd(), 'data', 'knowledge-base.json');
    this.initializeKnowledgeBase();
  }

  private async initializeKnowledgeBase() {
    try {
      // Try to load existing knowledge base
      const data = await fs.readFile(this.knowledgeFilePath, 'utf-8');
      this.knowledgeBase = JSON.parse(data);
    } catch (error) {
      // Initialize with APMEX sources if no existing knowledge base
      console.log('Initializing knowledge base with APMEX sources...');
      await this.initializeWithApmexSources();
    }
  }

  private async initializeWithApmexSources() {
    // Create data directory if it doesn't exist
    await fs.mkdir(path.dirname(this.knowledgeFilePath), { recursive: true });

    // Convert initial sources to KnowledgeSource format
    this.knowledgeBase = INITIAL_APMEX_SOURCES.map((source, index) => ({
      id: `apmex_${index}`,
      url: source.url,
      source_type: 'educational' as const,
      description: `APMEX educational content: ${source.category}`,
      tags: [source.category, source.type],
      last_updated: new Date(),
      content: undefined // Will be populated on first search
    }));

    await this.saveKnowledgeBase();
  }

  async searchKnowledgeBase(query: string, sourceTypes?: string[], maxResults: number = 10) {
    // Filter by source types if specified
    let sources = this.knowledgeBase;
    if (sourceTypes && sourceTypes.length > 0 && !sourceTypes.includes('all')) {
      sources = sources.filter(source => sourceTypes.includes(source.source_type));
    }

    // Simple text matching for now (could be enhanced with vector search)
    const queryLower = query.toLowerCase();
    const matchedSources = sources.filter(source => {
      const searchText = [
        source.description,
        ...(source.tags || []),
        source.url,
        source.content
      ].join(' ').toLowerCase();

      return searchText.includes(queryLower) ||
             source.tags?.some(tag => tag.includes(queryLower)) ||
             this.fuzzyMatch(queryLower, searchText);
    });

    // Sort by relevance (basic implementation)
    matchedSources.sort((a, b) => {
      const aRelevance = this.calculateRelevance(a, queryLower);
      const bRelevance = this.calculateRelevance(b, queryLower);
      return bRelevance - aRelevance;
    });

    const results = matchedSources.slice(0, maxResults);

    // Fetch content for results that don't have it cached
    for (const source of results) {
      if (!source.content) {
        try {
          source.content = await this.fetchAndParseContent(source.url);
          source.last_updated = new Date();
        } catch (error) {
          console.error(`Failed to fetch content for ${source.url}:`, error);
          source.content = `Error fetching content: ${error}`;
        }
      }
    }

    await this.saveKnowledgeBase();
    return results;
  }

  async addKnowledgeSource(url: string, sourceType: string, description?: string, tags?: string[]) {
    // Check if source already exists
    if (this.knowledgeBase.some(source => source.url === url)) {
      throw new Error('Knowledge source already exists');
    }

    const newSource: KnowledgeSource = {
      id: `user_${Date.now()}`,
      url,
      source_type: sourceType as any,
      description: description || `User-added ${sourceType} source`,
      tags: tags || [],
      last_updated: new Date(),
      content: undefined
    };

    // Try to fetch and parse content
    try {
      newSource.content = await this.fetchAndParseContent(url);
    } catch (error) {
      console.error(`Failed to fetch content for new source ${url}:`, error);
      newSource.content = `Error fetching content: ${error}`;
    }

    this.knowledgeBase.push(newSource);
    await this.saveKnowledgeBase();

    return newSource;
  }

  async listKnowledgeSources(filterByType?: string, searchTerm?: string) {
    let sources = this.knowledgeBase;

    if (filterByType) {
      sources = sources.filter(source => source.source_type === filterByType);
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      sources = sources.filter(source =>
        source.description?.toLowerCase().includes(searchLower) ||
        source.url.toLowerCase().includes(searchLower) ||
        source.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    return sources.map(source => ({
      id: source.id,
      url: source.url,
      source_type: source.source_type,
      description: source.description,
      tags: source.tags,
      last_updated: source.last_updated,
      has_content: !!source.content
    }));
  }

  async removeKnowledgeSource(id: string) {
    const index = this.knowledgeBase.findIndex(source => source.id === id);
    if (index === -1) {
      throw new Error('Knowledge source not found');
    }

    this.knowledgeBase.splice(index, 1);
    await this.saveKnowledgeBase();
    return true;
  }

  private async fetchAndParseContent(url: string): Promise<string> {
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Liberty-Content-Server/1.0)'
        }
      });

      const $ = cheerio.load(response.data);

      // Remove unwanted elements
      $('script, style, nav, footer, .advertisement, .ad').remove();

      // Extract main content
      let content = '';

      // Try to find main content containers
      const contentSelectors = [
        'main',
        '.content',
        '.post-content',
        '.article-content',
        '.entry-content',
        'article',
        '.main-content'
      ];

      for (const selector of contentSelectors) {
        const element = $(selector);
        if (element.length > 0) {
          content = element.text().trim();
          break;
        }
      }

      // Fallback to body if no specific content container found
      if (!content) {
        content = $('body').text().trim();
      }

      // Clean up content
      content = content
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n')
        .trim();

      return content.slice(0, 10000); // Limit content length

    } catch (error) {
      throw new Error(`Failed to fetch content from ${url}: ${error}`);
    }
  }

  private calculateRelevance(source: KnowledgeSource, query: string): number {
    let score = 0;
    const searchableText = [
      source.description || '',
      ...(source.tags || []),
      source.content || ''
    ].join(' ').toLowerCase();

    // Exact matches in description/tags get higher score
    if (source.description?.toLowerCase().includes(query)) {
      score += 10;
    }

    if (source.tags?.some(tag => tag.toLowerCase().includes(query))) {
      score += 8;
    }

    // Content matches get lower score
    if (source.content?.toLowerCase().includes(query)) {
      score += 3;
    }

    // URL relevance
    if (source.url.toLowerCase().includes(query)) {
      score += 5;
    }

    return score;
  }

  private fuzzyMatch(query: string, text: string): boolean {
    // Simple fuzzy matching - could be enhanced
    const words = query.split(' ');
    return words.some(word => text.includes(word) && word.length > 3);
  }

  private async saveKnowledgeBase() {
    try {
      await fs.writeFile(
        this.knowledgeFilePath,
        JSON.stringify(this.knowledgeBase, null, 2)
      );
    } catch (error) {
      console.error('Failed to save knowledge base:', error);
    }
  }

  // Get knowledge base statistics
  getStats() {
    const stats = {
      total_sources: this.knowledgeBase.length,
      by_type: {} as Record<string, number>,
      with_content: this.knowledgeBase.filter(s => s.content).length,
      last_updated: this.knowledgeBase.length > 0
        ? Math.max(...this.knowledgeBase.map(s => s.last_updated.getTime()))
        : null
    };

    for (const source of this.knowledgeBase) {
      stats.by_type[source.source_type] = (stats.by_type[source.source_type] || 0) + 1;
    }

    return stats;
  }
}
#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { ContentGenerator } from './tools/content-generator.js';
import { KnowledgeManager } from './tools/knowledge-manager.js';
import { BrandVoiceEngine } from './framework/brand-voice.js';
import { ContentAuditor } from './tools/content-auditor.js';
import { ContentRedesigner } from './tools/content-redesigner.js';
import { ContentRequest } from './types/index.js';

class LibertyContentServer {
  private server: Server;
  private contentGenerator: ContentGenerator;
  private knowledgeManager: KnowledgeManager;
  private contentAuditor: ContentAuditor;
  private contentRedesigner: ContentRedesigner;

  constructor() {
    this.server = new Server(
      {
        name: 'liberty-content-server',
        version: '1.0.0',
      }
    );

    this.contentGenerator = new ContentGenerator();
    this.knowledgeManager = new KnowledgeManager();
    this.contentAuditor = new ContentAuditor();
    this.contentRedesigner = new ContentRedesigner();

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'create_liberty_content',
            description: 'Generate content following Liberty Gold Silver Trust Through Education framework',
            inputSchema: {
              type: 'object',
              properties: {
                content_type: {
                  type: 'string',
                  enum: ['email', 'webpage', 'landing_page', 'blog', 'market_update'],
                  description: 'Type of content to generate'
                },
                topic: {
                  type: 'string',
                  description: 'Main topic or subject for the content'
                },
                target_audience: {
                  type: 'string',
                  enum: ['security_seekers', 'growth_hunters', 'legacy_builders', 'crisis_reactors', 'auto_detect'],
                  description: 'Target audience persona',
                  default: 'auto_detect'
                },
                tone_guidance: {
                  type: 'string',
                  description: 'Additional tone or style guidance'
                },
                length_target: {
                  type: 'string',
                  enum: ['short', 'medium', 'long'],
                  description: 'Desired content length',
                  default: 'medium'
                },
                include_cta: {
                  type: 'boolean',
                  description: 'Include call-to-action elements',
                  default: true
                }
              },
              required: ['content_type', 'topic']
            }
          },
          {
            name: 'search_knowledge_base',
            description: 'Search the Liberty Gold Silver knowledge base for relevant information',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search query for knowledge base'
                },
                source_types: {
                  type: 'array',
                  items: {
                    type: 'string',
                    enum: ['educational', 'market_data', 'competitor', 'news', 'all']
                  },
                  description: 'Filter by source types'
                },
                max_results: {
                  type: 'number',
                  description: 'Maximum number of results to return',
                  default: 10
                }
              },
              required: ['query']
            }
          },
          {
            name: 'generate_seo_metadata',
            description: 'Generate SEO metadata for content',
            inputSchema: {
              type: 'object',
              properties: {
                content: {
                  type: 'string',
                  description: 'Content to generate metadata for'
                },
                content_type: {
                  type: 'string',
                  enum: ['webpage', 'landing_page', 'blog'],
                  description: 'Type of content for SEO optimization'
                },
                primary_keyword: {
                  type: 'string',
                  description: 'Primary keyword to optimize for'
                },
                target_audience: {
                  type: 'string',
                  description: 'Target audience for SEO'
                }
              },
              required: ['content', 'content_type']
            }
          },
          {
            name: 'validate_brand_compliance',
            description: 'Validate content against Liberty Gold Silver brand guidelines',
            inputSchema: {
              type: 'object',
              properties: {
                content: {
                  type: 'string',
                  description: 'Content to validate'
                },
                content_type: {
                  type: 'string',
                  description: 'Type of content being validated'
                },
                check_disclaimers: {
                  type: 'boolean',
                  description: 'Whether to check for required disclaimers',
                  default: true
                }
              },
              required: ['content', 'content_type']
            }
          },
          {
            name: 'get_persona_guidance',
            description: 'Get targeting guidance for specific customer personas',
            inputSchema: {
              type: 'object',
              properties: {
                persona: {
                  type: 'string',
                  enum: ['security_seekers', 'growth_hunters', 'legacy_builders', 'crisis_reactors'],
                  description: 'Customer persona to get guidance for'
                },
                content_type: {
                  type: 'string',
                  description: 'Type of content being created'
                }
              },
              required: ['persona']
            }
          },
          {
            name: 'add_knowledge_source',
            description: 'Add a new source to the knowledge base',
            inputSchema: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  description: 'URL of the knowledge source'
                },
                source_type: {
                  type: 'string',
                  enum: ['educational', 'market_data', 'competitor', 'news'],
                  description: 'Type of knowledge source'
                },
                description: {
                  type: 'string',
                  description: 'Description of the source'
                },
                tags: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Tags to categorize the source'
                }
              },
              required: ['url', 'source_type']
            }
          },
          {
            name: 'list_knowledge_sources',
            description: 'List available knowledge sources',
            inputSchema: {
              type: 'object',
              properties: {
                filter_by_type: {
                  type: 'string',
                  description: 'Filter sources by type'
                },
                search_term: {
                  type: 'string',
                  description: 'Search term to filter sources'
                }
              }
            }
          },
          {
            name: 'audit_content',
            description: 'Perform comprehensive audit of content against Liberty Gold Silver framework',
            inputSchema: {
              type: 'object',
              properties: {
                content: {
                  type: 'string',
                  description: 'Content to audit for framework compliance'
                },
                content_type: {
                  type: 'string',
                  description: 'Type of content being audited'
                }
              },
              required: ['content']
            }
          },
          {
            name: 'redesign_content',
            description: 'Redesign and transform content to align with Liberty Gold Silver framework',
            inputSchema: {
              type: 'object',
              properties: {
                original_content: {
                  type: 'string',
                  description: 'Original content to redesign'
                },
                content_type: {
                  type: 'string',
                  enum: ['email', 'webpage', 'landing_page', 'blog', 'market_update'],
                  description: 'Type of content being redesigned'
                },
                target_audience: {
                  type: 'string',
                  enum: ['security_seekers', 'growth_hunters', 'legacy_builders', 'crisis_reactors'],
                  description: 'Target audience for redesigned content'
                },
                preserve_key_information: {
                  type: 'boolean',
                  description: 'Whether to preserve key facts and data from original',
                  default: true
                },
                redesign_intensity: {
                  type: 'string',
                  enum: ['light', 'moderate', 'complete'],
                  description: 'Intensity of redesign transformation',
                  default: 'moderate'
                },
                specific_requirements: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Specific requirements for the redesign'
                }
              },
              required: ['original_content']
            }
          }
        ] as Tool[]
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'create_liberty_content':
            return await this.handleCreateContent(args as any);

          case 'search_knowledge_base':
            return await this.handleSearchKnowledge(args);

          case 'generate_seo_metadata':
            return await this.handleGenerateSEO(args);

          case 'validate_brand_compliance':
            return await this.handleValidateCompliance(args);

          case 'get_persona_guidance':
            return await this.handleGetPersonaGuidance(args);

          case 'add_knowledge_source':
            return await this.handleAddKnowledgeSource(args);

          case 'list_knowledge_sources':
            return await this.handleListKnowledgeSources(args);

          case 'audit_content':
            return await this.handleAuditContent(args);

          case 'redesign_content':
            return await this.handleRedesignContent(args);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error executing ${name}: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    });
  }

  private async handleCreateContent(args: any) {
    const result = await this.contentGenerator.generateContent(args);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  }

  private async handleSearchKnowledge(args: any) {
    const results = await this.knowledgeManager.searchKnowledgeBase(
      args.query,
      args.source_types,
      args.max_results
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(results, null, 2)
        }
      ]
    };
  }

  private async handleGenerateSEO(args: any) {
    // Extract SEO metadata from content
    const generator = new ContentGenerator();
    const metadata = await (generator as any).generateSEOMetadata(args.content, {
      content_type: args.content_type
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(metadata, null, 2)
        }
      ]
    };
  }

  private async handleValidateCompliance(args: any) {
    const validation = BrandVoiceEngine.validateBrandCompliance(args.content);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            brand_voice_score: validation.score,
            disclaimers_included: validation.disclaimers_included,
            issues: validation.issues,
            compliance_status: validation.score >= 80 ? 'PASSED' : 'NEEDS_IMPROVEMENT'
          }, null, 2)
        }
      ]
    };
  }

  private async handleGetPersonaGuidance(args: any) {
    const guidance = BrandVoiceEngine.getPersonaGuidance(args.persona);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(guidance, null, 2)
        }
      ]
    };
  }

  private async handleAddKnowledgeSource(args: any) {
    const source = await this.knowledgeManager.addKnowledgeSource(
      args.url,
      args.source_type,
      args.description,
      args.tags
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            source: {
              id: source.id,
              url: source.url,
              source_type: source.source_type,
              description: source.description,
              tags: source.tags
            }
          }, null, 2)
        }
      ]
    };
  }

  private async handleListKnowledgeSources(args: any) {
    const sources = await this.knowledgeManager.listKnowledgeSources(
      args.filter_by_type,
      args.search_term
    );

    const stats = this.knowledgeManager.getStats();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            stats,
            sources
          }, null, 2)
        }
      ]
    };
  }

  private async handleAuditContent(args: any) {
    const audit = this.contentAuditor.auditContent(args.content, args.content_type);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(audit, null, 2)
        }
      ]
    };
  }

  private async handleRedesignContent(args: any) {
    const redesignRequest = {
      original_content: args.original_content,
      content_type: args.content_type,
      target_audience: args.target_audience,
      preserve_key_information: args.preserve_key_information !== false,
      redesign_intensity: args.redesign_intensity || 'moderate',
      specific_requirements: args.specific_requirements || []
    };

    const result = await this.contentRedesigner.redesignContent(redesignRequest);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  }

  private setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Liberty Gold Silver Content Server started');
  }
}

// Start the server
const server = new LibertyContentServer();
server.start().catch(console.error);
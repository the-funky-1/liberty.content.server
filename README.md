# Liberty Gold Silver Content Server

MCP server implementing the "Trust Through Education" content framework for Liberty Gold Silver. This server provides AI agents (Claude Code, Gemini CLI, etc.) with specialized tools for creating brand-compliant precious metals content.

## Features

### Core Tools
- **`create_liberty_content`**: Generate content following the Liberty Gold Silver framework
- **`search_knowledge_base`**: Query 200+ curated precious metals resources
- **`generate_seo_metadata`**: Create SEO-optimized metadata for web content
- **`validate_brand_compliance`**: Ensure content meets brand voice standards
- **`get_persona_guidance`**: Target specific customer personas
- **`add_knowledge_source`**: Dynamically expand the knowledge base
- **`list_knowledge_sources`**: Manage and browse knowledge sources
- **`audit_content`**: **NEW** - Comprehensive content audit against framework standards
- **`redesign_content`**: **NEW** - Intelligent content transformation to align with framework

### Content Types Supported
- Email sequences
- Web pages
- Landing pages
- Blog articles
- Market updates

### Brand Framework Implementation
- **Trust Through Education** philosophy enforcement
- Three-pass content refinement system
- Automated brand voice validation
- Required financial disclaimers
- Persona-specific messaging adaptation

## Installation

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

3. Start the server:
```bash
npm start
```

For development:
```bash
npm run dev
```

## Usage with AI Agents

### Claude Code Integration
Add to your Claude Code MCP configuration:
```json
{
  "mcpServers": {
    "liberty-content": {
      "command": "node",
      "args": ["/path/to/liberty-content-server/dist/index.js"],
      "env": {}
    }
  }
}
```

### Example Usage
```javascript
// Create a blog article
const result = await callTool('create_liberty_content', {
  content_type: 'blog',
  topic: 'Gold IRA benefits for retirement planning',
  target_audience: 'security_seekers',
  length_target: 'long',
  include_cta: true
});

// Search knowledge base
const knowledge = await callTool('search_knowledge_base', {
  query: 'gold ira tax benefits',
  source_types: ['educational'],
  max_results: 5
});

// Add new knowledge source
const newSource = await callTool('add_knowledge_source', {
  url: 'https://example.com/precious-metals-guide',
  source_type: 'educational',
  description: 'Comprehensive precious metals investing guide',
  tags: ['investing', 'education', 'gold', 'silver']
});

// NEW: Audit existing content
const audit = await callTool('audit_content', {
  content: 'Your existing blog post or marketing content...',
  content_type: 'blog'
});

// NEW: Redesign non-compliant content
const redesigned = await callTool('redesign_content', {
  original_content: 'Content that needs Liberty Gold Silver framework alignment...',
  content_type: 'landing_page',
  target_audience: 'security_seekers',
  redesign_intensity: 'moderate',
  preserve_key_information: true
});
```

## Framework Compliance

All generated content automatically:
- Follows "Trust Through Education" brand voice
- Targets conservative investors aged 45-75
- Includes appropriate financial disclaimers
- Avoids aggressive sales tactics
- Emphasizes educational value
- Maintains professional, authoritative tone

### NEW: Content Audit & Redesign System

**Comprehensive Audit Features:**
- Brand voice compliance scoring (0-100)
- Audience alignment analysis for 45-75 demographic
- Content structure and readability assessment
- Compliance requirement validation
- Sales tactics detection and scoring
- Detailed recommendations for improvement

**Intelligent Redesign Capabilities:**
- Light, moderate, or complete transformation options
- Key information preservation during redesign
- Persona-specific language adaptation
- Automatic compliance enhancement
- Before/after comparison with improvement metrics

## Knowledge Base

Initialized with 200+ curated APMEX educational resources covering:
- Gold and Silver IRAs
- Precious metals fundamentals
- Market analysis and history
- Investment strategies
- Economic trends and inflation

## Development

### Project Structure
```
src/
├── index.ts              # Main MCP server
├── types/               # TypeScript definitions
├── tools/               # Core functionality
│   ├── content-generator.ts
│   └── knowledge-manager.ts
├── framework/           # Brand voice implementation
│   └── brand-voice.ts
└── knowledge/          # Initial knowledge sources
    └── initial-sources.ts
```

### Build Commands
- `npm run build` - Compile TypeScript
- `npm run dev` - Development mode with hot reload
- `npm run lint` - Code linting
- `npm test` - Run tests

## License

MIT License - See LICENSE file for details
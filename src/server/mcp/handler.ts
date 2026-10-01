import { db } from '../db.ts';
import { MaterialService } from '../materials/service.ts';

export interface MCPRequest {
  jsonrpc: '2.0';
  id?: string | number;
  method: string;
  params?: any;
}

export interface MCPResponse {
  jsonrpc: '2.0';
  id?: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export class MCPHandler {
  /**
   * List available tools for external MCP client (like dsh)
   */
  static listTools() {
    return [
      {
        name: 'search_materials',
        description: '检索本地素材知识库中的条目，支持中文智能分词与标签筛选',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: '搜索关键词' },
            tag: { type: 'string', description: '按标签名过滤（可选）' }
          }
        }
      },
      {
        name: 'get_material',
        description: '根据素材 ID 读取素材正文内容',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: '素材唯一 ID' }
          },
          required: ['id']
        }
      },
      {
        name: 'save_material',
        description: '将新知识或研究结论保存到本地素材知识库中',
        inputSchema: {
          type: 'object',
          properties: {
            title: { type: 'string', description: '素材标题' },
            body: { type: 'string', description: '素材正文内容' },
            tags: { type: 'array', items: { type: 'string' }, description: '标签数组' }
          },
          required: ['title', 'body']
        }
      },
      {
        name: 'get_lore',
        description: '读取小说的设定库条目（时空、势力、规则、事件等）',
        inputSchema: {
          type: 'object',
          properties: {
            novel_id: { type: 'string', description: '小说 ID' },
            query: { type: 'string', description: '筛选关键词（可选）' }
          },
          required: ['novel_id']
        }
      },
      {
        name: 'list_characters',
        description: '读取小说的全部角色档案及人物关系卡',
        inputSchema: {
          type: 'object',
          properties: {
            novel_id: { type: 'string', description: '小说 ID' }
          },
          required: ['novel_id']
        }
      }
    ];
  }

  /**
   * Execute an MCP tool call
   */
  static async executeTool(name: string, args: any): Promise<any> {
    switch (name) {
      case 'search_materials': {
        const results = MaterialService.search(args?.query || '', args?.tag);
        return {
          matches: results.slice(0, 10).map(m => ({
            id: m.id,
            title: m.title,
            tags: m.tags,
            preview: m.body.slice(0, 200)
          }))
        };
      }

      case 'get_material': {
        const row = db.prepare('SELECT * FROM materials WHERE id = ?').get(args.id);
        if (!row) throw new Error(`素材不存在: ${args.id}`);
        return row;
      }

      case 'save_material': {
        const allowWrite = db.prepare("SELECT value FROM settings WHERE key = 'mcpWriteAllowed'").get()?.['value'] !== '0';
        if (!allowWrite) {
          throw new Error('外部 MCP 写入功能已被用户在设置中关闭');
        }
        const saved = MaterialService.saveMaterial({
          title: args.title,
          body: args.body,
          tags: args.tags || ['dsh-agent'],
          kind: 'ai'
        });
        return { success: true, materialId: saved.material.id, isDuplicate: saved.isDuplicate };
      }

      case 'get_lore': {
        const lores = db.prepare('SELECT * FROM lore_entries WHERE novel_id = ?').all(args.novel_id);
        return {
          novelId: args.novel_id,
          lores: lores.map((l: any) => ({
            id: l.id,
            type: l.type,
            name: l.name,
            content: l.content,
            always_on: l.always_on
          }))
        };
      }

      case 'list_characters': {
        const chars = db.prepare('SELECT * FROM characters WHERE novel_id = ?').all(args.novel_id);
        return {
          novelId: args.novel_id,
          characters: chars.map((c: any) => ({
            id: c.id,
            name: c.name,
            role: c.role,
            profile: c.profile,
            voice: c.voice
          }))
        };
      }

      default:
        throw new Error(`未知的 MCP 工具: ${name}`);
    }
  }

  /**
   * Handle JSON-RPC 2.0 requests
   */
  static async handleRpc(req: MCPRequest): Promise<MCPResponse> {
    const id = req.id;
    try {
      if (req.method === 'tools/list') {
        return {
          jsonrpc: '2.0',
          id,
          result: { tools: this.listTools() }
        };
      }

      if (req.method === 'tools/call') {
        const toolName = req.params?.name;
        const toolArgs = req.params?.arguments || {};
        const result = await this.executeTool(toolName, toolArgs);
        return {
          jsonrpc: '2.0',
          id,
          result: { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
        };
      }

      return {
        jsonrpc: '2.0',
        id,
        error: { code: -32601, message: `Method not found: ${req.method}` }
      };
    } catch (err: any) {
      return {
        jsonrpc: '2.0',
        id,
        error: { code: -32000, message: err?.message || String(err) }
      };
    }
  }
}

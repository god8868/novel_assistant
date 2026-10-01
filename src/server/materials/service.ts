import { db } from '../db.ts';
import crypto from 'crypto';

export interface MaterialItem {
  id: string;
  kind: 'web' | 'text' | 'file' | 'ai' | 'report';
  title: string;
  body: string;
  source_url?: string;
  file_path?: string;
  favorite: number;
  tags?: string[];
  created_at: number;
  updated_at: number;
}

export class MaterialService {
  private static segmenter = new Intl.Segmenter('zh-CN', { granularity: 'word' });

  /**
   * Tokenize text into words using Node built-in Intl.Segmenter
   */
  static tokenize(text: string): string[] {
    if (!text) return [];
    const segments = Array.from(this.segmenter.segment(text));
    return segments
      .map(s => s.segment.trim())
      .filter(w => w.length > 0 && !/^[\s,，.。!！?？:：“”"'\(\)（）]+$/.test(w));
  }

  /**
   * Create or update material with content-hash deduplication
   */
  static saveMaterial(data: {
    id?: string;
    kind?: 'web' | 'text' | 'file' | 'ai' | 'report';
    title: string;
    body: string;
    source_url?: string;
    tags?: string[];
    favorite?: number;
  }): { material: MaterialItem; isDuplicate: boolean } {
    const hash = crypto.createHash('sha256').update(data.body.trim()).digest('hex');

    // Check duplicate
    const existing: any = db.prepare('SELECT * FROM materials WHERE content_hash = ?').get(hash);
    if (existing && (!data.id || existing.id !== data.id)) {
      return { material: existing, isDuplicate: true };
    }

    const now = Date.now();
    const id = data.id || `mat-${now}-${Math.random().toString(36).slice(2, 7)}`;
    const kind = data.kind || 'text';
    const fav = data.favorite !== undefined ? data.favorite : 0;

    db.prepare(`
      INSERT INTO materials (id, kind, title, body, source_url, content_hash, favorite, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        body = excluded.body,
        source_url = excluded.source_url,
        favorite = excluded.favorite,
        updated_at = excluded.updated_at
    `).run(id, kind, data.title, data.body, data.source_url || null, hash, fav, now, now);

    // Save tags
    if (data.tags && Array.isArray(data.tags)) {
      db.prepare('DELETE FROM material_tags WHERE material_id = ?').run(id);
      for (const tag of data.tags) {
        const cleanTag = tag.trim();
        if (!cleanTag) continue;
        const tagId = `tag-${cleanTag}`;
        db.prepare('INSERT OR IGNORE INTO tags (id, name) VALUES (?, ?)').run(tagId, cleanTag);
        db.prepare('INSERT OR IGNORE INTO material_tags (material_id, tag_id) VALUES (?, ?)').run(id, tagId);
      }
    }

    const res: any = db.prepare('SELECT * FROM materials WHERE id = ?').get(id);
    return { material: res, isDuplicate: false };
  }

  /**
   * Chinese Full-Text Search with Intl.Segmenter word extraction & ranking
   */
  static search(query: string, tagFilter?: string): MaterialItem[] {
    const allMaterials: any[] = db.prepare(`
      SELECT m.*, GROUP_CONCAT(t.name) as tag_names
      FROM materials m
      LEFT JOIN material_tags mt ON m.id = mt.material_id
      LEFT JOIN tags t ON mt.tag_id = t.id
      GROUP BY m.id
      ORDER BY m.favorite DESC, m.updated_at DESC
    `).all();

    if (!query && !tagFilter) {
      return allMaterials.map(m => ({
        ...m,
        tags: m.tag_names ? m.tag_names.split(',') : []
      }));
    }

    const searchTokens = this.tokenize(query.toLowerCase());

    const scored = allMaterials.map(m => {
      let score = 0;
      const titleLower = (m.title || '').toLowerCase();
      const bodyLower = (m.body || '').toLowerCase();
      const tagsList = m.tag_names ? m.tag_names.split(',') : [];

      if (tagFilter && !tagsList.includes(tagFilter)) {
        return { item: m, score: -1, tags: tagsList };
      }

      if (query) {
        // Direct substring bonus
        if (titleLower.includes(query.toLowerCase())) score += 50;
        if (bodyLower.includes(query.toLowerCase())) score += 20;

        // Tokenized match
        for (const tok of searchTokens) {
          if (titleLower.includes(tok)) score += 15;
          if (bodyLower.includes(tok)) score += 5;
        }
      } else {
        score = 10;
      }

      if (m.favorite) score += 5;

      return { item: m, score, tags: tagsList };
    });

    return scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(s => ({
        ...s.item,
        tags: s.tags
      }));
  }

  /**
   * Link material to chat topic or novel chapter/lore
   */
  static linkMaterial(materialId: string, targetType: 'topic' | 'lore' | 'chapter', targetId: string) {
    if (targetType === 'topic') {
      db.prepare('INSERT OR IGNORE INTO topic_materials (topic_id, material_id) VALUES (?, ?)').run(targetId, materialId);
    } else {
      db.prepare('INSERT OR IGNORE INTO material_links (material_id, target_type, target_id) VALUES (?, ?, ?)').run(materialId, targetType, targetId);
    }
  }

  static unlinkMaterial(materialId: string, targetType: 'topic' | 'lore' | 'chapter', targetId: string) {
    if (targetType === 'topic') {
      db.prepare('DELETE FROM topic_materials WHERE topic_id = ? AND material_id = ?').run(targetId, materialId);
    } else {
      db.prepare('DELETE FROM material_links WHERE material_id = ? AND target_type = ? AND target_id = ?').run(materialId, targetType, targetId);
    }
  }

  static getTopicMaterials(topicId: string): MaterialItem[] {
    const rows: any[] = db.prepare(`
      SELECT m.*
      FROM materials m
      JOIN topic_materials tm ON m.id = tm.material_id
      WHERE tm.topic_id = ?
    `).all(topicId);
    return rows;
  }
}

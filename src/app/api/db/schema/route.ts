import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/db/schema — Tüm modelleri ve alanlarını listele
 */
export async function GET() {
  // Prisma schema'yı dlasa'dan oku
  const models = Object.keys(Prisma).filter(
    (k) => !k.startsWith('_') && !k.includes('.Decimal') && !k.includes('Json') && typeof (Prisma as any)[k] === 'object'
  );

  const schemas = models.map((model) => {
    // Prisma modelinin alanlarını introspect et
    const fields = getModelFields(model);
    return {
      name: model,
      fields,
    };
  }).filter((s) => s.fields.length > 0);

  return NextResponse.json({ models: schemas });
}

function getModelFields(modelName: string): Array<{ name: string; type: string; isId: boolean; isUnique: boolean; isRequired: boolean; isRelation: boolean }> {
  // Prisma'da model field'larına dinamik erişim — basitleştirilmiş
  const knownModels: Record<string, Array<{ name: string; type: string; isId: boolean; isUnique: boolean; isRequired: boolean; isRelation: boolean }>> = {
    Project: [
      { name: 'id', type: 'String', isId: true, isUnique: true, isRequired: true, isRelation: false },
      { name: 'name', type: 'String', isId: false, isUnique: false, isRequired: true, isRelation: false },
      { name: 'description', type: 'String', isId: false, isUnique: false, isRequired: false, isRelation: false },
      { name: 'template', type: 'String', isId: false, isUnique: false, isRequired: false, isRelation: false },
      { name: 'standard', type: 'String', isId: false, isUnique: false, isRequired: false, isRelation: false },
      { name: 'status', type: 'String', isId: false, isUnique: false, isRequired: true, isRelation: false },
      { name: 'createdAt', type: 'DateTime', isId: false, isUnique: false, isRequired: true, isRelation: false },
      { name: 'updatedAt', type: 'DateTime', isId: false, isUnique: false, isRequired: true, isRelation: false },
    ],
    File: [
      { name: 'id', type: 'String', isId: true, isUnique: true, isRequired: true, isRelation: false },
      { name: 'projectId', type: 'String', isId: false, isUnique: false, isRequired: true, isRelation: true },
      { name: 'path', type: 'String', isId: false, isUnique: false, isRequired: true, isRelation: false },
      { name: 'content', type: 'String', isId: false, isUnique: false, isRequired: true, isRelation: false },
      { name: 'language', type: 'String', isId: false, isUnique: false, isRequired: false, isRelation: false },
      { name: 'createdAt', type: 'DateTime', isId: false, isUnique: false, isRequired: true, isRelation: false },
      { name: 'updatedAt', type: 'DateTime', isId: false, isUnique: false, isRequired: true, isRelation: false },
    ],
    Message: [
      { name: 'id', type: 'String', isId: true, isUnique: true, isRequired: true, isRelation: false },
      { name: 'projectId', type: 'String', isId: false, isUnique: false, isRequired: true, isRelation: true },
      { name: 'role', type: 'String', isId: false, isUnique: false, isRequired: true, isRelation: false },
      { name: 'content', type: 'String', isId: false, isUnique: false, isRequired: true, isRelation: false },
      { name: 'modelUsed', type: 'String', isId: false, isUnique: false, isRequired: false, isRelation: false },
      { name: 'tokensIn', type: 'Int', isId: false, isUnique: false, isRequired: false, isRelation: false },
      { name: 'tokensOut', type: 'Int', isId: false, isUnique: false, isRequired: false, isRelation: false },
      { name: 'latencyMs', type: 'Int', isId: false, isUnique: false, isRequired: false, isRelation: false },
      { name: 'metadata', type: 'String', isId: false, isUnique: false, isRequired: false, isRelation: false },
      { name: 'createdAt', type: 'DateTime', isId: false, isUnique: false, isRequired: true, isRelation: false },
    ],
    Version: [
      { name: 'id', type: 'String', isId: true, isUnique: true, isRequired: true, isRelation: false },
      { name: 'projectId', type: 'String', isId: false, isUnique: false, isRequired: true, isRelation: true },
      { name: 'version', type: 'String', isId: false, isUnique: false, isRequired: true, isRelation: false },
      { name: 'message', type: 'String', isId: false, isUnique: false, isRequired: false, isRelation: false },
      { name: 'snapshot', type: 'String', isId: false, isUnique: false, isRequired: true, isRelation: false },
      { name: 'createdAt', type: 'DateTime', isId: false, isUnique: false, isRequired: true, isRelation: false },
    ],
    AgentTemplate: [
      { name: 'id', type: 'String', isId: true, isUnique: true, isRequired: true, isRelation: false },
      { name: 'name', type: 'String', isId: false, isUnique: false, isRequired: true, isRelation: false },
      { name: 'description', type: 'String', isId: false, isUnique: false, isRequired: false, isRelation: false },
      { name: 'category', type: 'String', isId: false, isUnique: false, isRequired: true, isRelation: false },
      { name: 'nodes', type: 'String', isId: false, isUnique: false, isRequired: true, isRelation: false },
      { name: 'edges', type: 'String', isId: false, isUnique: false, isRequired: true, isRelation: false },
      { name: 'systemPrompt', type: 'String', isId: false, isUnique: false, isRequired: false, isRelation: false },
      { name: 'isPublic', type: 'Boolean', isId: false, isUnique: false, isRequired: true, isRelation: false },
      { name: 'tags', type: 'String', isId: false, isUnique: false, isRequired: false, isRelation: false },
      { name: 'version', type: 'Int', isId: false, isUnique: false, isRequired: true, isRelation: false },
      { name: 'createdAt', type: 'DateTime', isId: false, isUnique: false, isRequired: true, isRelation: false },
      { name: 'updatedAt', type: 'DateTime', isId: false, isUnique: false, isRequired: true, isRelation: false },
    ],
    AgentTree: [
      { name: 'id', type: 'String', isId: true, isUnique: true, isRequired: true, isRelation: false },
      { name: 'projectId', type: 'String', isId: false, isUnique: false, isRequired: false, isRelation: true },
      { name: 'templateId', type: 'String', isId: false, isUnique: false, isRequired: false, isRelation: true },
      { name: 'name', type: 'String', isId: false, isUnique: false, isRequired: true, isRelation: false },
      { name: 'status', type: 'String', isId: false, isUnique: false, isRequired: true, isRelation: false },
      { name: 'nodes', type: 'String', isId: false, isUnique: false, isRequired: true, isRelation: false },
      { name: 'edges', type: 'String', isId: false, isUnique: false, isRequired: true, isRelation: false },
      { name: 'results', type: 'String', isId: false, isUnique: false, isRequired: false, isRelation: false },
      { name: 'startedAt', type: 'DateTime', isId: false, isUnique: false, isRequired: false, isRelation: false },
      { name: 'completedAt', type: 'DateTime', isId: false, isUnique: false, isRequired: false, isRelation: false },
      { name: 'createdAt', type: 'DateTime', isId: false, isUnique: false, isRequired: true, isRelation: false },
      { name: 'updatedAt', type: 'DateTime', isId: false, isUnique: false, isRequired: true, isRelation: false },
    ],
    Connector: [
      { name: 'id', type: 'String', isId: true, isUnique: true, isRequired: true, isRelation: false },
      { name: 'type', type: 'String', isId: false, isUnique: false, isRequired: true, isRelation: false },
      { name: 'name', type: 'String', isId: false, isUnique: false, isRequired: true, isRelation: false },
      { name: 'description', type: 'String', isId: false, isUnique: false, isRequired: false, isRelation: false },
      { name: 'config', type: 'String', isId: false, isUnique: false, isRequired: true, isRelation: false },
      { name: 'status', type: 'String', isId: false, isUnique: false, isRequired: true, isRelation: false },
      { name: 'lastSync', type: 'DateTime', isId: false, isUnique: false, isRequired: false, isRelation: false },
      { name: 'createdAt', type: 'DateTime', isId: false, isUnique: false, isRequired: true, isRelation: false },
      { name: 'updatedAt', type: 'DateTime', isId: false, isUnique: false, isRequired: true, isRelation: false },
    ],
    KnowledgeBase: [
      { name: 'id', type: 'String', isId: true, isUnique: true, isRequired: true, isRelation: false },
      { name: 'name', type: 'String', isId: false, isUnique: false, isRequired: true, isRelation: false },
      { name: 'description', type: 'String', isId: false, isUnique: false, isRequired: false, isRelation: false },
      { name: 'embeddingModel', type: 'String', isId: false, isUnique: false, isRequired: true, isRelation: false },
      { name: 'chunkCount', type: 'Int', isId: false, isUnique: false, isRequired: true, isRelation: false },
      { name: 'createdAt', type: 'DateTime', isId: false, isUnique: false, isRequired: true, isRelation: false },
      { name: 'updatedAt', type: 'DateTime', isId: false, isUnique: false, isRequired: true, isRelation: false },
    ],
    KnowledgeDocument: [
      { name: 'id', type: 'String', isId: true, isUnique: true, isRequired: true, isRelation: false },
      { name: 'kbId', type: 'String', isId: false, isUnique: false, isRequired: true, isRelation: true },
      { name: 'title', type: 'String', isId: false, isUnique: false, isRequired: true, isRelation: false },
      { name: 'content', type: 'String', isId: false, isUnique: false, isRequired: true, isRelation: false },
      { name: 'chunks', type: 'String', isId: false, isUnique: false, isRequired: false, isRelation: false },
      { name: 'metadata', type: 'String', isId: false, isUnique: false, isRequired: false, isRelation: false },
      { name: 'createdAt', type: 'DateTime', isId: false, isUnique: false, isRequired: true, isRelation: false },
    ],
    ShareLink: [
      { name: 'id', type: 'String', isId: true, isUnique: true, isRequired: true, isRelation: false },
      { name: 'token', type: 'String', isId: false, isUnique: true, isRequired: true, isRelation: false },
      { name: 'projectId', type: 'String', isId: false, isUnique: false, isRequired: true, isRelation: true },
      { name: 'name', type: 'String', isId: false, isUnique: false, isRequired: false, isRelation: false },
      { name: 'expiresAt', type: 'DateTime', isId: false, isUnique: false, isRequired: false, isRelation: false },
      { name: 'viewCount', type: 'Int', isId: false, isUnique: false, isRequired: true, isRelation: false },
      { name: 'isActive', type: 'Boolean', isId: false, isUnique: false, isRequired: true, isRelation: false },
      { name: 'createdAt', type: 'DateTime', isId: false, isUnique: false, isRequired: true, isRelation: false },
    ],
    Setting: [
      { name: 'id', type: 'String', isId: true, isUnique: true, isRequired: true, isRelation: false },
      { name: 'key', type: 'String', isId: false, isUnique: true, isRequired: true, isRelation: false },
      { name: 'value', type: 'String', isId: false, isUnique: false, isRequired: true, isRelation: false },
      { name: 'updatedAt', type: 'DateTime', isId: false, isUnique: false, isRequired: true, isRelation: false },
    ],
    Skill: [
      { name: 'id', type: 'String', isId: true, isUnique: true, isRequired: true, isRelation: false },
      { name: 'name', type: 'String', isId: false, isUnique: true, isRequired: true, isRelation: false },
      { name: 'description', type: 'String', isId: false, isUnique: false, isRequired: true, isRelation: false },
      { name: 'category', type: 'String', isId: false, isUnique: false, isRequired: true, isRelation: false },
      { name: 'file', type: 'String', isId: false, isUnique: false, isRequired: true, isRelation: false },
      { name: 'enabled', type: 'Boolean', isId: false, isUnique: false, isRequired: true, isRelation: false },
      { name: 'version', type: 'String', isId: false, isUnique: false, isRequired: true, isRelation: false },
      { name: 'createdAt', type: 'DateTime', isId: false, isUnique: false, isRequired: true, isRelation: false },
      { name: 'updatedAt', type: 'DateTime', isId: false, isUnique: false, isRequired: true, isRelation: false },
    ],
    AgentRun: [
      { name: 'id', type: 'String', isId: true, isUnique: true, isRequired: true, isRelation: false },
      { name: 'projectId', type: 'String', isId: false, isUnique: false, isRequired: false, isRelation: false },
      { name: 'status', type: 'String', isId: false, isUnique: false, isRequired: true, isRelation: false },
      { name: 'plan', type: 'String', isId: false, isUnique: false, isRequired: false, isRelation: false },
      { name: 'steps', type: 'String', isId: false, isUnique: false, isRequired: false, isRelation: false },
      { name: 'toolsUsed', type: 'String', isId: false, isUnique: false, isRequired: false, isRelation: false },
      { name: 'createdAt', type: 'DateTime', isId: false, isUnique: false, isRequired: true, isRelation: false },
      { name: 'updatedAt', type: 'DateTime', isId: false, isUnique: false, isRequired: true, isRelation: false },
    ],
  };

  return knownModels[modelName] || [];
}

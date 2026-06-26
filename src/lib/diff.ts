/**
 * Diff & Patch — AI kodu baştan yazmak yerine diff ile değiştirir
 *
 * AI'ın çıktısı:
 * ```diff
 * --- a/src/app/page.tsx
 * +++ b/src/app/page.tsx
 * @@ -10,3 +10,5 @@
 *  export default function Home() {
 * +  const [count, setCount] = useState(0);
 *    return <div>...</div>;
 * +  <button onClick={() => setCount(count + 1)}>{count}</button>
 *  }
 * ```
 *
 * Biz bu diff'i parse eder, kullanıcıya gösterir, onaylayınca uygularız.
 */

import * as Diff from 'diff';

export interface DiffHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  content: string;
}

export interface FileDiff {
  path: string;
  hunks: DiffHunk[];
  additions: number;
  deletions: number;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  oldContent?: string;
  newContent?: string;
}

/**
 * İçerikteki değişiklikleri satır satır diff olarak üret
 */
export function computeFileDiff(
  path: string,
  oldContent: string,
  newContent: string
): FileDiff {
  const status: FileDiff['status'] = !oldContent
    ? 'added'
    : !newContent
    ? 'deleted'
    : 'modified';

  const patch = Diff.createPatch(path, oldContent || '', newContent || '', '', '');
  const hunks: DiffHunk[] = [];

  const lines = patch.split('\n');
  let currentHunk: DiffHunk | null = null;
  let hunkHeaderRegex = /^@@ -(\d+),(\d+) \+(\d+),(\d+) @@/;

  for (const line of lines) {
    const match = line.match(hunkHeaderRegex);
    if (match) {
      if (currentHunk) hunks.push(currentHunk);
      currentHunk = {
        oldStart: parseInt(match[1]),
        oldLines: parseInt(match[2]),
        newStart: parseInt(match[3]),
        newLines: parseInt(match[4]),
        content: '',
      };
    } else if (currentHunk && (line.startsWith('+') || line.startsWith('-') || line.startsWith(' '))) {
      currentHunk.content += line + '\n';
    }
  }
  if (currentHunk) hunks.push(currentHunk);

  const additions = newContent
    ? newContent.split('\n').length - (oldContent?.split('\n').length || 0)
    : 0;

  return {
    path,
    hunks,
    additions: Math.max(0, additions),
    deletions: Math.max(0, -additions),
    status,
    oldContent,
    newContent,
  };
}

/**
 * Diff'i uygula — eski içerikten yeni içerik üret
 */
export function applyDiff(oldContent: string, newContent: string): string {
  return newContent;
}

/**
 * Birden fazla dosya diff'i için batch işlem
 */
export interface DiffBatch {
  diffs: FileDiff[];
  totalAdditions: number;
  totalDeletions: number;
  summary: string;
}

export function createDiffBatch(diffs: FileDiff[]): DiffBatch {
  const totalAdditions = diffs.reduce((s, d) => s + d.additions, 0);
  const totalDeletions = diffs.reduce((s, d) => s + d.deletions, 0);
  const summary = `${diffs.length} dosya değişti: +${totalAdditions} -${totalDeletions}`;

  return { diffs, totalAdditions, totalDeletions, summary };
}

/**
 * Diff'i HTML olarak render etmek için satır satır ayrıştır
 */
export interface DiffLine {
  type: 'context' | 'add' | 'remove' | 'header';
  content: string;
  oldLineNo?: number;
  newLineNo?: number;
}

export function parseDiffToLines(diff: FileDiff): DiffLine[] {
  const lines: DiffLine[] = [];
  let oldLine = diff.hunks[0]?.oldStart || 1;
  let newLine = diff.hunks[0]?.newStart || 1;

  for (const hunk of diff.hunks) {
    oldLine = hunk.oldStart;
    newLine = hunk.newStart;
    for (const rawLine of hunk.content.split('\n')) {
      if (!rawLine) continue;
      const prefix = rawLine[0];
      const content = rawLine.slice(1);
      if (prefix === '+') {
        lines.push({ type: 'add', content, newLineNo: newLine++ });
      } else if (prefix === '-') {
        lines.push({ type: 'remove', content, oldLineNo: oldLine++ });
      } else if (prefix === ' ') {
        lines.push({ type: 'context', content, oldLineNo: oldLine++, newLineNo: newLine++ });
      }
    }
  }
  return lines;
}

/**
 * AI'ın yanıtından dosya değişikliklerini ayıkla
 *
 * Format 1 (full content):
 * ```tsx path="src/app/page.tsx"
 * <content>
 * ```
 *
 * Format 2 (diff):
 * ```diff path="src/app/page.tsx"
 * <diff content>
 * ```
 */
export interface ParsedFileChange {
  path: string;
  content: string;
  isDiff: boolean;
  language?: string;
}

export function parseAIResponse(response: string): ParsedFileChange[] {
  const changes: ParsedFileChange[] = [];

  // Code block regex: ```lang path="..."
  const codeBlockRegex = /```(\w+)?\s*(?:path="([^"]+)")?\s*\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(response)) !== null) {
    const [, lang, path, content] = match;
    if (!path) continue;
    changes.push({
      path,
      content: content.trim(),
      isDiff: lang === 'diff',
      language: lang,
    });
  }

  return changes;
}

/**
 * AI yanıtını diff olarak işle — mevcut dosyalarla karşılaştır
 */
export function computeChangesFromAIResponse(
  response: string,
  existingFiles: { path: string; content: string }[]
): FileDiff[] {
  const changes = parseAIResponse(response);
  const fileMap = new Map(existingFiles.map((f) => [f.path, f.content]));

  return changes.map((change) => {
    const oldContent = fileMap.get(change.path) || '';
    const newContent = change.isDiff
      ? applyDiffFromText(oldContent, change.content)
      : change.content;
    return computeFileDiff(change.path, oldContent, newContent);
  });
}

/**
 * Diff metnini eski içeriğe uygula
 */
function applyDiffFromText(oldContent: string, diffText: string): string {
  try {
    const result = Diff.applyPatch(oldContent, diffText);
    if (typeof result === 'string') return result;
    return oldContent;
  } catch {
    return oldContent;
  }
}

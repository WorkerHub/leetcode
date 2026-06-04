// src/scripts/build-index.mjs
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { loadProblems } from './content-loader.mjs';

const DEFAULT_CONTENT_ROOT = join(process.cwd(), 'content');
const DEFAULT_OUTPUT = join(process.cwd(), 'public', 'search-index.json');
const ZH_TITLES_PATH = join(process.cwd(), 'public', 'zh-titles.json');

function loadZhTitles() {
  if (!existsSync(ZH_TITLES_PATH)) return null;
  return JSON.parse(readFileSync(ZH_TITLES_PATH, 'utf-8'));
}

export function writeIndex(contentRoot, outputPath) {
  const problems = loadProblems(contentRoot);
  const zhTitles = loadZhTitles();

  if (zhTitles) {
    for (const p of problems) {
      p.titleZh = zhTitles[String(p.number)] ?? '';
    }
  }

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, JSON.stringify(problems, null, 2), 'utf-8');
  console.log(`Generated search index: ${problems.length} problems → ${outputPath}`);
}

// Run when executed directly (prebuild script)
const isMain = fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  writeIndex(DEFAULT_CONTENT_ROOT, DEFAULT_OUTPUT);
}

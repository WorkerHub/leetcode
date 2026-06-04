// src/scripts/build-index.mjs
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { loadProblems } from './content-loader.mjs';

const DEFAULT_CONTENT_ROOT = join(process.cwd(), 'content');
const DEFAULT_OUTPUT = join(process.cwd(), 'public', 'search-index.json');

export function writeIndex(contentRoot, outputPath) {
  const problems = loadProblems(contentRoot);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, JSON.stringify(problems, null, 2), 'utf-8');
  console.log(`Generated search index: ${problems.length} problems → ${outputPath}`);
}

// Run when executed directly (prebuild script)
const isMain = fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  writeIndex(DEFAULT_CONTENT_ROOT, DEFAULT_OUTPUT);
}

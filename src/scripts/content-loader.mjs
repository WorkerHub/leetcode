// src/scripts/content-loader.mjs
import { readFileSync, readdirSync } from 'fs';
import { join, basename } from 'path';
import matter from 'gray-matter';

const LANGUAGES = ['java', 'python', 'javascript', 'shell', 'sql'];

export function extractNumber(filename) {
  const match = filename.match(/^(\d+)\./);
  return match ? parseInt(match[1], 10) : null;
}

export function extractTitle(titleStr) {
  return titleStr
    .replace(/^\d+\./, '')
    .split('-')
    .map(word => (isNaN(word) ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(' ');
}

export function loadProblems(contentRoot) {
  const problemMap = new Map();

  for (const lang of LANGUAGES) {
    const dir = join(contentRoot, lang);
    let files;
    try {
      files = readdirSync(dir).filter(f => f.endsWith('.md'));
    } catch {
      continue;
    }

    for (const filename of files) {
      const slug = basename(filename, '.md');
      const raw = readFileSync(join(dir, filename), 'utf-8');
      const { data } = matter(raw);
      const number = extractNumber(slug);

      if (!problemMap.has(slug)) {
        problemMap.set(slug, {
          number,
          slug,
          title: extractTitle(data.title || slug),
          difficulty: data.categories || 'unknown',
          tags: Array.isArray(data.tags) ? data.tags : [],
          languages: [],
        });
      }
      problemMap.get(slug).languages.push(lang);
    }
  }

  return Array.from(problemMap.values()).sort((a, b) => a.number - b.number);
}

export function loadProblemSolutions(slug, contentRoot) {
  const solutions = {};
  for (const lang of LANGUAGES) {
    const filePath = join(contentRoot, lang, `${slug}.md`);
    try {
      const raw = readFileSync(filePath, 'utf-8');
      const { data, content } = matter(raw);
      solutions[lang] = { data, content };
    } catch {
      // file not available for this language
    }
  }
  return solutions;
}

// src/scripts/render-pages.mjs
//
// Hugo-inspired batch renderer for problem detail pages.
// Runs as a `postbuild` step AFTER `astro build`.
//
// Why faster than Astro SSG:
//  1. marked + hljs initialized ONCE, not once-per-page
//  2. Parallel batches (Promise.all) – similar to Hugo goroutines
//  3. Writes HTML to disk immediately – no in-memory accumulation
//  4. No Vite / framework overhead per page

import { writeFileSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { loadProblems, loadProblemSolutions } from './content-loader.mjs';
import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';

const ROOT        = join(fileURLToPath(import.meta.url), '../../..');
const CONTENT_ROOT = join(ROOT, 'content');
const DIST_ROOT    = join(ROOT, 'dist');

/** How many problems to render concurrently (tweak to taste). */
const BATCH_SIZE = 50;

// ─── Initialize heavy dependencies ONCE ──────────────────────────────────────
marked.use(markedHighlight({
  langPrefix: 'hljs language-',
  highlight(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Resolve the CSS file that Astro emitted to dist/_astro/*.css */
function findBuiltCSS() {
  try {
    const files = readdirSync(join(DIST_ROOT, '_astro')).filter(f => f.endsWith('.css'));
    return files.length > 0 ? `/_astro/${files[0]}` : null;
  } catch {
    return null;
  }
}

const DIFFICULTY_STYLE = {
  easy:   'color:#16a34a;background:#f0fdf4;border-color:#bbf7d0',
  medium: 'color:#d97706;background:#fffbeb;border-color:#fde68a',
  hard:   'color:#dc2626;background:#fef2f2;border-color:#fecaca',
};

function buildTabs(langs, solutions) {
  const btns = langs
    .map(l => `<button class="tab-btn px-4 py-2 text-sm font-medium rounded-t border-b-2 transition-colors" data-lang="${l}">${l[0].toUpperCase() + l.slice(1)}</button>`)
    .join('\n    ');
  const panels = langs
    .map(l => `<div class="tab-panel prose max-w-none" data-lang="${l}">${solutions[l] ?? ''}</div>`)
    .join('\n  ');
  return `<div>\n  <div class="flex gap-1 border-b border-gray-200 mb-4">\n    ${btns}\n  </div>\n  ${panels}\n</div>`;
}

function tabScript(defaultLang) {
  return `<script>(function(){
  var btns=document.querySelectorAll('.tab-btn'),panels=document.querySelectorAll('.tab-panel');
  function activate(lang){
    btns.forEach(function(b){var a=b.dataset.lang===lang;b.classList.toggle('border-blue-500',a);b.classList.toggle('text-blue-600',a);b.classList.toggle('border-transparent',!a);b.classList.toggle('text-gray-500',!a);});
    panels.forEach(function(p){p.style.display=p.dataset.lang===lang?'':'none';});
  }
  btns.forEach(function(b){b.addEventListener('click',function(){activate(b.dataset.lang);});});
  activate('${defaultLang}');
})();<\/script>`;
}

function buildPage(problem, solutions, cssHref) {
  const diffStyle = DIFFICULTY_STYLE[problem.difficulty] ?? 'color:#6b7280;background:#f9fafb;border-color:#e5e7eb';
  const tagsHtml  = problem.tags
    .map(t => `<span style="font-size:.875rem;background:#eff6ff;color:#1d4ed8;border:1px solid #dbeafe;padding:.125rem .625rem;border-radius:9999px">${t}</span>`)
    .join(' ');
  const cssLink   = cssHref ? `<link rel="stylesheet" href="${cssHref}" />` : '';
  const langs     = problem.languages;
  const body      = langs.length > 1
    ? buildTabs(langs, solutions)
    : `<div class="prose max-w-none">${solutions[langs[0]] ?? ''}</div>`;

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>#${problem.number} ${problem.title}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  ${cssLink}
</head>
<body class="bg-gray-50 text-gray-900 min-h-screen">
  <div class="max-w-3xl mx-auto px-4 py-8">
    <a href="/" class="text-blue-500 hover:underline text-sm mb-6 inline-block">← 返回列表</a>
    <div class="mb-6">
      <h1 class="text-2xl font-bold mb-3">
        <span class="text-gray-400 font-mono mr-2">#${problem.number}</span>
        ${problem.title}
      </h1>
      <div class="flex flex-wrap gap-2 items-center">
        <span style="font-size:.875rem;font-weight:500;padding:.125rem .625rem;border-radius:9999px;border:1px solid;${diffStyle}">${problem.difficulty}</span>
        ${tagsHtml}
      </div>
    </div>
    ${body}
  </div>
  ${langs.length > 1 ? tabScript(langs[0]) : ''}
</body>
</html>`;
}

// ─── Per-problem task ──────────────────────────────────────────────────────────

async function renderOne(problem, cssHref) {
  const rawSolutions = loadProblemSolutions(problem.slug, CONTENT_ROOT);
  const solutions = {};
  for (const [lang, sol] of Object.entries(rawSolutions)) {
    // marked.parse() is sync in marked v14+; use it to avoid async overhead
    solutions[lang] = marked.parse(sol.content);
  }
  const html = buildPage(problem, solutions, cssHref);
  const dir  = join(DIST_ROOT, 'problems', String(problem.number));
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html, 'utf-8');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const problems = loadProblems(CONTENT_ROOT);
  const cssHref  = findBuiltCSS();
  const total    = problems.length;

  console.log(`Rendering ${total} problem pages in batches of ${BATCH_SIZE}...`);
  const t0 = Date.now();

  for (let i = 0; i < total; i += BATCH_SIZE) {
    const batch = problems.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(p => renderOne(p, cssHref)));
    process.stdout.write(`\r  ${Math.min(i + BATCH_SIZE, total)}/${total} pages rendered...`);
  }

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\nDone – ${total} pages in ${elapsed}s → dist/problems/`);
}

const isMain = fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  main().catch(err => { console.error(err); process.exit(1); });
}

export { renderOne, buildPage, findBuiltCSS };

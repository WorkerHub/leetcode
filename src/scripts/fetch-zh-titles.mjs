// src/scripts/fetch-zh-titles.mjs
//
// Fetches Chinese problem titles from leetcode.cn GraphQL API.
// Outputs a JSON mapping of problem number → Chinese title.
// Run: node src/scripts/fetch-zh-titles.mjs

import { writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(fileURLToPath(import.meta.url), '../../..');
const OUTPUT = join(ROOT, 'public', 'zh-titles.json');
const API = 'https://leetcode.cn/graphql/';
const LIMIT = 100;

async function fetchBatch(skip) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `query problemsetQuestionList($limit: Int, $skip: Int) {
        problemsetQuestionList(limit: $limit, skip: $skip) {
          total
          hasMore
          questions {
            frontendQuestionId
            titleCn
          }
        }
      }`,
      variables: { limit: LIMIT, skip },
    }),
  });
  const json = await res.json();
  return json.data.problemsetQuestionList;
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const { total } = await fetchBatch(0);
  console.log(`Total problems on leetcode.cn: ${total}`);

  const map = {};
  let skip = 0;
  while (skip < total) {
    const { hasMore, questions } = await fetchBatch(skip);
    for (const q of questions) {
      if (q.titleCn) {
        map[q.frontendQuestionId] = q.titleCn;
      }
    }
    skip += LIMIT;
    console.log(`  ${Math.min(skip, total)}/${total} fetched (${Object.keys(map).length} titles)`);
    if (!hasMore) break;
    await delay(300); // avoid rate limiting
  }

  writeFileSync(OUTPUT, JSON.stringify(map, null, 2), 'utf-8');
  console.log(`Written ${Object.keys(map).length} Chinese titles → ${OUTPUT}`);
}

const isMain = fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  main().catch(err => { console.error(err); process.exit(1); });
}

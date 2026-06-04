// src/scripts/__tests__/build-index.test.mjs
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeIndex } from '../build-index.mjs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, existsSync, unlinkSync } from 'fs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const FIXTURES = join(__dirname, 'fixtures', 'content');
const OUTPUT = join(__dirname, 'fixtures', 'test-output.json');

beforeEach(() => {
  if (existsSync(OUTPUT)) unlinkSync(OUTPUT);
});

afterEach(() => {
  if (existsSync(OUTPUT)) unlinkSync(OUTPUT);
});

describe('writeIndex', () => {
  it('writes valid JSON array to output path', () => {
    writeIndex(FIXTURES, OUTPUT);
    expect(existsSync(OUTPUT)).toBe(true);
    const content = JSON.parse(readFileSync(OUTPUT, 'utf-8'));
    expect(Array.isArray(content)).toBe(true);
  });

  it('output contains expected problem entries', () => {
    writeIndex(FIXTURES, OUTPUT);
    const index = JSON.parse(readFileSync(OUTPUT, 'utf-8'));
    const twoSum = index.find(p => p.slug === '1.two-sum');
    expect(twoSum).toBeDefined();
    expect(twoSum.number).toBe(1);
    expect(twoSum.languages).toContain('java');
    expect(twoSum.languages).toContain('python');
  });

  it('output is sorted by problem number', () => {
    writeIndex(FIXTURES, OUTPUT);
    const index = JSON.parse(readFileSync(OUTPUT, 'utf-8'));
    const numbers = index.map(p => p.number);
    expect(numbers).toEqual([...numbers].sort((a, b) => a - b));
  });
});

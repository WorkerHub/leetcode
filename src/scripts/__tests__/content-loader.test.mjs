// src/scripts/__tests__/content-loader.test.mjs
import { describe, it, expect } from 'vitest';
import { extractNumber, extractTitle, loadProblems, loadProblemSolutions } from '../content-loader.mjs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const FIXTURES = join(__dirname, 'fixtures', 'content');

describe('extractNumber', () => {
  it('extracts number from standard filename', () => {
    expect(extractNumber('1.two-sum')).toBe(1);
  });

  it('extracts 4-digit number', () => {
    expect(extractNumber('1009.complement-of-base-10-integer')).toBe(1009);
  });

  it('returns null for filename without number prefix', () => {
    expect(extractNumber('no-number')).toBeNull();
  });
});

describe('extractTitle', () => {
  it('converts slug to title case', () => {
    expect(extractTitle('1.two-sum')).toBe('Two Sum');
  });

  it('preserves numeric tokens without capitalizing', () => {
    expect(extractTitle('1009.complement-of-base-10-integer')).toBe('Complement Of Base 10 Integer');
  });

  it('handles single word after number', () => {
    expect(extractTitle('14.longest')).toBe('Longest');
  });
});

describe('loadProblems', () => {
  it('merges java and python files with same name into one entry', () => {
    const problems = loadProblems(FIXTURES);
    const twoSum = problems.find(p => p.slug === '1.two-sum');
    expect(twoSum).toBeDefined();
    expect(twoSum.languages).toContain('java');
    expect(twoSum.languages).toContain('python');
    expect(twoSum.languages).toHaveLength(2);
  });

  it('returns correct metadata for merged problem', () => {
    const problems = loadProblems(FIXTURES);
    const twoSum = problems.find(p => p.slug === '1.two-sum');
    expect(twoSum.number).toBe(1);
    expect(twoSum.title).toBe('Two Sum');
    expect(twoSum.difficulty).toBe('easy');
    expect(twoSum.tags).toEqual(['哈希表', '数组']);
  });

  it('includes javascript-only problem as separate entry', () => {
    const problems = loadProblems(FIXTURES);
    const combine = problems.find(p => p.slug === '175.combine-two-tables');
    expect(combine).toBeDefined();
    expect(combine.languages).toEqual(['javascript']);
  });

  it('sorts problems by number ascending', () => {
    const problems = loadProblems(FIXTURES);
    const numbers = problems.map(p => p.number);
    expect(numbers).toEqual([...numbers].sort((a, b) => a - b));
  });

  it('returns empty array when content root does not exist', () => {
    const problems = loadProblems('/nonexistent/path');
    expect(problems).toEqual([]);
  });
});

describe('loadProblemSolutions', () => {
  it('returns content for each available language', () => {
    const solutions = loadProblemSolutions('1.two-sum', FIXTURES);
    expect(solutions.java).toBeDefined();
    expect(solutions.python).toBeDefined();
    expect(solutions.java.content).toContain('twoSum');
  });

  it('does not include languages where file is missing', () => {
    const solutions = loadProblemSolutions('1.two-sum', FIXTURES);
    expect(solutions.javascript).toBeUndefined();
    expect(solutions.shell).toBeUndefined();
    expect(solutions.sql).toBeUndefined();
  });

  it('returns correct frontmatter data', () => {
    const solutions = loadProblemSolutions('1.two-sum', FIXTURES);
    expect(solutions.java.data.categories).toBe('easy');
    expect(solutions.java.data.tags).toEqual(['哈希表', '数组']);
  });
});

#!/usr/bin/env node
import { dirname } from 'path';
import * as core from '@actions/core';
import { globby } from 'globby';
import micromatch from 'micromatch';

function isEmpty(xs) {
  return xs.length === 0;
}

function getInputs() {
  const patterns = core.getMultilineInput('patterns');
  const rootPatterns = core.getMultilineInput('root-patterns');
  if (isEmpty(patterns) && isEmpty(rootPatterns)) {
    throw new Error('Either "patterns" or "root-patterns" must be provided');
  }
  if (!isEmpty(patterns) && !isEmpty(rootPatterns)) {
    throw new Error('Only one of "patterns" or "root-patterns" can be provided');
  }
  const filterPatterns = core.getMultilineInput('filter-patterns', {
    required: true,
  });
  let source = core.getInput('source') || null;
  try {
    source = JSON.parse(source);
  } catch (err) {
    throw new Error(
      'If provided, "source" must be a JSON-formatted array of filepaths',
      { cause: err },
    );
  }
  return {
    patterns,
    rootPatterns,
    filterPatterns,
    source,
  };
}

async function fsGlob(patterns) {
  return globby(patterns, {
    expandDirectories: false,
    gitignore: true,
    markDirectories: true,
    onlyFiles: false,
  });
}

function memGlob(patterns, source) {
  return micromatch(source, patterns);
}

function glob(patterns, source = null) {
  return source ? memGlob(patterns, source) : fsGlob(patterns);
}

async function directMatch(patterns, source) {
  const matches = await glob(patterns, source);
  core.debug(JSON.stringify({ patterns, matches, source }, null, 2));
  core.setOutput('matches', matches);
}

function hoist(rootPatterns, paths) {
  const roots = [];
  let remaining = [...paths];
  do {
    roots.push(...micromatch(remaining, rootPatterns));
    remaining = micromatch
      .not(remaining, rootPatterns)
      .map((x) => `${dirname(x)}/`);
  } while (remaining.filter((x) => x !== './').length > 0);
  roots.push(...micromatch(remaining, rootPatterns));
  return Array.from(new Set(roots));
}

async function hoistMatch(rootPatterns, filterPatterns) {
  const fromFilters = await fsGlob(filterPatterns);
  const matches = hoist(rootPatterns, fromFilters);
  core.debug(JSON.stringify({
    rootPatterns,
    filterPatterns,
    fromFilters,
    matches,
  }, null, 2));
  core.setOutput('matches', matches);
}

(async () => {
  const {
    filterPatterns,
    patterns,
    rootPatterns,
    source,
  } = getInputs();
  switch (true) {
    case !isEmpty(patterns):
      directMatch(patterns, source);
      break;
    case !isEmpty(rootPatterns):
      hoistMatch(rootPatterns, filterPatterns);
      break;
    default:
      throw new Error('Unreachable');
  }
})();

#!/usr/bin/env node
import * as core from '@actions/core';
import { globby } from 'globby';

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
  return { patterns, rootPatterns, filterPatterns };
}

async function fsGlob(patterns) {
  return globby(patterns, {
    expandDirectories: false,
    gitignore: true,
    markDirectories: true,
    onlyFiles: false,
  });
}

async function directMatch(patterns) {
  const matches = await fsGlob(patterns);
  core.debug(JSON.stringify({ patterns, matches }, null, 2));
  core.setOutput('matches', matches);
}

(async () => {
  const { patterns, rootPatterns } = getInputs();
  switch (true) {
    case !isEmpty(patterns):
      directMatch(patterns);
      break;
    case !isEmpty(rootPatterns):
      throw new Error('Not implemented');
    default:
      throw new Error('Unreachable');
  }
})();

#!/usr/bin/env node
import * as core from '@actions/core';
import { globby } from 'globby';

function isEmpty(xs) {
  return xs.length === 0;
}

function getInputs() {
  const patterns = core.getMultilineInput('patterns');
  const rootPatterns = core.getMultilineInput('rootPatterns');
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

(async () => {
  const { patterns } = getInputs();
  const matches = await globby(patterns, {
    expandDirectories: false,
    gitignore: true,
    markDirectories: true,
    onlyFiles: false,
  });
  core.debug(JSON.stringify({ patterns, matches }, null, 2));
  core.setOutput('matches', matches);
})();

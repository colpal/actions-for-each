#!/usr/bin/env node
import * as core from '@actions/core';
import { globby } from 'globby';

(async () => {
  const patterns = core.getMultilineInput('patterns', { required: true });
  const matches = await globby(patterns, {
    expandDirectories: false,
    gitignore: true,
    markDirectories: true,
    onlyFiles: false,
  });
  core.debug({ matches, patterns });
  core.setOutput('matches', matches);
})();

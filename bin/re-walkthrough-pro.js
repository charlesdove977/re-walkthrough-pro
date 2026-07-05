#!/usr/bin/env node
/**
 * re-walkthrough-pro CLI
 *
 * Installs the re-walkthrough-pro Claude Code skill into either the
 * user-global directory (~/.claude/skills/re-walkthrough-pro/) or the
 * current project's .claude/skills/re-walkthrough-pro/ directory.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const SKILL_NAME = 're-walkthrough-pro';
const PACKAGE_ROOT = path.resolve(__dirname, '..');
const SKILL_SRC = path.join(PACKAGE_ROOT, 'skill');
const PKG = require(path.join(PACKAGE_ROOT, 'package.json'));

function userClaudeDir() {
  return path.join(os.homedir(), '.claude');
}

function projectClaudeDir() {
  return path.join(process.cwd(), '.claude');
}

function resolveSkillTarget(opts) {
  const base = opts.project ? projectClaudeDir() : userClaudeDir();
  return path.join(base, 'skills', SKILL_NAME);
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d);
    } else if (entry.isFile()) {
      fs.copyFileSync(s, d);
    }
  }
}

function rmrf(target) {
  if (!fs.existsSync(target)) return;
  fs.rmSync(target, { recursive: true, force: true });
}

function install(opts) {
  const target = resolveSkillTarget(opts);
  const exists = fs.existsSync(target);

  if (exists && !opts.force) {
    console.error(
      `[re-walkthrough-pro] Skill already installed at:\n  ${target}\n\n` +
        `Run with --update to overwrite, or --uninstall to remove first.`
    );
    process.exitCode = 1;
    return;
  }

  if (exists && opts.force) {
    rmrf(target);
  }

  copyDir(SKILL_SRC, target);

  console.log(`[re-walkthrough-pro] Skill installed:`);
  console.log(`  ${target}`);
  console.log('');
  console.log(`Invoke from Claude Code with:  /${SKILL_NAME}`);
  console.log(`Give it an Airbnb / Booking URL, or drop your own images, and it'll build a cinematic walkthrough or ad.`);
  console.log('');
  console.log(`Requires: Higgsfield MCP + (Apify MCP if scraping listings) connected in Claude Code, and ffmpeg installed.`);
}

function uninstall(opts) {
  const target = resolveSkillTarget(opts);
  if (fs.existsSync(target)) {
    rmrf(target);
    console.log(`[re-walkthrough-pro] Removed skill: ${target}`);
  } else {
    console.log(`[re-walkthrough-pro] Nothing to uninstall at ${target}`);
  }
}

function where(opts) {
  console.log(resolveSkillTarget(opts));
}

function help() {
  console.log(`re-walkthrough-pro v${PKG.version}

Install the re-walkthrough-pro Claude Code skill.

Usage:
  npx re-walkthrough-pro <command> [flags]

Commands:
  install         Install skill to ~/.claude/skills/${SKILL_NAME}/
  update          Same as install, but overwrite if already present
  uninstall       Remove skill from the target directory
  where           Print the target install path and exit
  --help, -h      Show this message
  --version, -v   Show version

Flags:
  --project       Install into the current project's ./.claude/ instead of ~/.claude/

Examples:
  npx re-walkthrough-pro install
  npx re-walkthrough-pro install --project
  npx re-walkthrough-pro update
  npx re-walkthrough-pro uninstall

Skill name once installed: /${SKILL_NAME}
Repo:                       https://github.com/GiancarloLazazzera/re-walkthrough-pro
`);
}

function parseArgs(argv) {
  const opts = { project: false, force: false };
  let cmd = null;
  for (const arg of argv) {
    if (arg === '--project') opts.project = true;
    else if (arg === '--update' || arg === '--force' || arg === '-f') opts.force = true;
    else if (arg === '--help' || arg === '-h') cmd = '__help';
    else if (arg === '--version' || arg === '-v') cmd = '__version';
    else if (!arg.startsWith('-') && cmd === null) cmd = arg;
  }
  return { cmd, opts };
}

function main() {
  const { cmd, opts } = parseArgs(process.argv.slice(2));

  switch (cmd) {
    case 'install':
      install(opts);
      return;
    case 'update':
      opts.force = true;
      install(opts);
      return;
    case 'uninstall':
      uninstall(opts);
      return;
    case 'where':
      where(opts);
      return;
    case '__version':
      console.log(PKG.version);
      return;
    case '__help':
    case null:
    default:
      help();
      return;
  }
}

main();

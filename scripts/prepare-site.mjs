#!/usr/bin/env node
/**
 * آماده‌سازی خروجی استاتیک برای استقرار و جایگزینی نشانی عمومی سایت.
 * ---
 * Prepares the static deployment output and replaces the public site URL.
 */

import { access, cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const outputDirectory = path.join(root, 'site');
const requiredPaths = [
  '404.html',
  'cards-form.html',
  'cards-scripts.js',
  'cards-styles.css',
  'index.html',
  'payment-form.html',
  'payment-scripts.js',
  'payment-styles.css',
  'robots.txt',
  'sitemap.xml',
  'assets',
  'fonts',
  'images',
  'src',
];
const replaceableFiles = ['index.html', 'cards-form.html', 'payment-form.html', 'robots.txt', 'sitemap.xml'];

function getSiteOrigin(value) {
  if (!value) throw new Error('SITE_ORIGIN is required, for example: https://example.org');

  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error('SITE_ORIGIN must be an absolute http(s) URL.');
  }

  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
    throw new Error('SITE_ORIGIN must be a clean absolute http(s) URL without credentials, query, or fragment.');
  }

  return url.href.replace(/\/$/, '');
}

async function assertRequiredPaths() {
  await Promise.all(requiredPaths.map(async relativePath => {
    try {
      await access(path.join(root, relativePath));
    } catch {
      throw new Error(`Required source path is missing: ${relativePath}`);
    }
  }));
}

async function replaceOriginTokens(siteOrigin) {
  for (const relativePath of replaceableFiles) {
    const filePath = path.join(outputDirectory, relativePath);
    const source = await readFile(filePath, 'utf8');
    const output = source.replaceAll('__SITE_ORIGIN__', siteOrigin);

    if (output.includes('__SITE_ORIGIN__')) {
      throw new Error(`Unresolved site-origin token in ${relativePath}`);
    }

    await writeFile(filePath, output, 'utf8');
  }
}

async function assertNoUnresolvedTokens(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await assertNoUnresolvedTokens(entryPath);
    } else if (/\.(?:html|xml|txt)$/i.test(entry.name)) {
      const content = await readFile(entryPath, 'utf8');
      if (content.includes('__SITE_ORIGIN__')) {
        throw new Error(`Unresolved site-origin token in ${path.relative(outputDirectory, entryPath)}`);
      }
    }
  }
}

async function main() {
  const siteOrigin = getSiteOrigin(process.env.SITE_ORIGIN);
  await assertRequiredPaths();
  await rm(outputDirectory, { recursive: true, force: true });
  await mkdir(outputDirectory, { recursive: true });

  await Promise.all(requiredPaths.map(relativePath => cp(
    path.join(root, relativePath),
    path.join(outputDirectory, relativePath),
    { recursive: true },
  )));

  await replaceOriginTokens(siteOrigin);
  await assertNoUnresolvedTokens(outputDirectory);
  console.log(`Prepared static site in ${path.relative(root, outputDirectory)} for ${siteOrigin}`);
}

main().catch(error => {
  console.error(`Build failed: ${error.message}`);
  process.exitCode = 1;
});

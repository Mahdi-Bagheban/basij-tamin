#!/usr/bin/env node
/**
 * اعتبارسنجی سبک فایل‌های سایت و ارجاعات محلی آن‌ها، بدون وابستگی خارجی.
 * ---
 * Performs lightweight validation of site files and local references without external dependencies.
 */

import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const sourceFiles = [
  '404.html',
  'cards-form.html',
  'cards-styles.css',
  'index.html',
  'payment-form.html',
  'payment-styles.css',
  'robots.txt',
  'sitemap.xml',
];
const outputDirectory = path.join(root, 'site');
const sourceReferencePattern = /\b(?:src|href)\s*=\s*["']([^"']+)["']/gi;
const cssReferencePattern = /url\(\s*["']?([^"')]+)["']?\s*\)/gi;
const inlineHandlerPattern = /\son[a-z]+\s*=\s*["']/i;
// Pages that must stay free of inline scripts so a strict CSP can be applied.
const cspStrictPages = ['cards-form.html', 'payment-form.html'];
const inlineScriptPattern = /<script(?![^>]*\bsrc\s*=)[^>]*>/i;

/**
 * بررسی نبود هندلر اینلاین و اسکریپت اینلاین در صفحات با CSP سخت‌گیرانه.
 * ---
 * Ensures no inline handlers exist and CSP-strict pages carry no inline scripts.
 * @param {string} relativePath - مسیر نسبی فایل / file path relative to its root
 * @param {string} content - محتوای HTML / HTML content
 */
function assertCspSafety(relativePath, content) {
  if (inlineHandlerPattern.test(content)) {
    throw new Error(`Inline event handler found (CSP regression): ${relativePath}`);
  }
  if (cspStrictPages.includes(path.basename(relativePath)) && inlineScriptPattern.test(content)) {
    throw new Error(`Inline <script> found on a CSP-strict page: ${relativePath}`);
  }
}

function isExternalOrFragment(value) {
  return /^(?:[a-z][a-z\d+.-]*:|\/\/|#|data:|__SITE_ORIGIN__)/i.test(value);
}

function normalizeReference(value) {
  return value.split(/[?#]/, 1)[0].trim();
}

async function assertFile(filePath) {
  try {
    await access(filePath);
  } catch {
    throw new Error(`Missing local reference: ${path.relative(root, filePath)}`);
  }
}

async function validateReferences(filePath, rootDirectory) {
  const content = await readFile(filePath, 'utf8');
  const patterns = [sourceReferencePattern, cssReferencePattern];

  if (/\.html$/i.test(filePath)) assertCspSafety(path.relative(rootDirectory, filePath), content);

  for (const pattern of patterns) {
    pattern.lastIndex = 0;
    for (const match of content.matchAll(pattern)) {
      const reference = normalizeReference(match[1]);
      if (!reference || isExternalOrFragment(reference)) continue;

      const resolvedPath = reference.startsWith('/')
        ? path.join(rootDirectory, reference.slice(1))
        : path.resolve(path.dirname(filePath), reference);
      await assertFile(resolvedPath);
    }
  }
}

async function listFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(entryPath));
    else files.push(entryPath);
  }
  return files;
}

async function validateSource() {
  for (const relativePath of sourceFiles) {
    const filePath = path.join(root, relativePath);
    await assertFile(filePath);
    if (/\.(?:html|css)$/i.test(relativePath)) await validateReferences(filePath, root);
  }
}

async function validateOutputIfPresent() {
  try {
    await access(outputDirectory);
  } catch {
    return;
  }

  const files = await listFiles(outputDirectory);
  for (const filePath of files) {
    if (/\.(?:html|xml|txt)$/i.test(filePath)) {
      const content = await readFile(filePath, 'utf8');
      if (content.includes('__SITE_ORIGIN__')) {
        throw new Error(`Unresolved site-origin token: ${path.relative(root, filePath)}`);
      }
    }
    if (/\.(?:html|css)$/i.test(filePath)) await validateReferences(filePath, outputDirectory);
  }
}

async function main() {
  await validateSource();
  await validateOutputIfPresent();
  console.log('Static-site reference validation passed.');
}

main().catch(error => {
  console.error(`Validation failed: ${error.message}`);
  process.exitCode = 1;
});

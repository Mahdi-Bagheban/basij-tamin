#!/usr/bin/env node
/**
 * آماده‌سازی خروجی استاتیک برای استقرار و جایگزینی نشانی عمومی سایت.
 * ---
 * Prepares the static deployment output and replaces the public site URL.
 */

import { access, cp, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import * as terser from 'terser';
const terserMinify = terser.minify;
import CleanCSS from 'clean-css';

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
    // ISO date (YYYY-MM-DD) used for sitemap freshness signals.
    const buildDate = new Date().toISOString().slice(0, 10);

    for (const relativePath of replaceableFiles) {
        const filePath = path.join(outputDirectory, relativePath);
        const source = await readFile(filePath, 'utf8');
        const output = source
            .replaceAll('__SITE_ORIGIN__', siteOrigin)
            .replaceAll('__BUILD_DATE__', buildDate);

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

    // Copy and process files
    for (const relativePath of requiredPaths) {
        const sourcePath = path.join(root, relativePath);
        const destPath = path.join(outputDirectory, relativePath);
        const sourceStat = await stat(sourcePath);
        if (sourceStat.isDirectory()) {
            await cp(sourcePath, destPath, { recursive: true });
        } else {
            let source = await readFile(sourcePath, 'utf8');

            // Minify JS and CSS files
            if (relativePath.endsWith('.js')) {
                const minified = await terserMinify(source, {});
                source = minified.code;
            } else if (relativePath.endsWith('.css')) {
                source = new CleanCSS({}).minify(source).styles;
            }

            // Replace tokens in HTML/XML/TXT files
            if (replaceableFiles.includes(relativePath)) {
                const buildDate = new Date().toISOString().slice(0, 10);
                source = source
                    .replaceAll('__SITE_ORIGIN__', siteOrigin)
                    .replaceAll('__BUILD_DATE__', buildDate);

                if (source.includes('__SITE_ORIGIN__')) {
                    throw new Error(`Unresolved site-origin token in ${relativePath}`);
                }
            }

            await writeFile(destPath, source, 'utf8');
        }
    }

    await assertNoUnresolvedTokens(outputDirectory);
    console.log(`Prepared static site in ${path.relative(root, outputDirectory)} for ${siteOrigin}`);
}

main().catch(error => {
    console.error(`Build failed: ${error.message}`);
    process.exitCode = 1;
});
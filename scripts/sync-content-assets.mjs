import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const contentDir = path.join(rootDir, 'content');
const outputDir = path.join(rootDir, 'public', 'content-assets');

function hasMarkdownFiles(dirPath) {
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const itemPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (hasMarkdownFiles(itemPath)) {
        return true;
      }
    } else if (entry.name.endsWith('.md')) {
      return true;
    }
  }

  return false;
}

function copyDirectory(sourceDir, targetDir) {
  fs.mkdirSync(targetDir, { recursive: true });

  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name.endsWith('.md')) {
      continue;
    }

    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, targetPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

function syncAssets(dirPath, basePath = '') {
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const itemPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      syncAssets(itemPath, path.join(basePath, entry.name));
      continue;
    }

    if (!entry.name.endsWith('.md')) {
      continue;
    }

    const articleName = entry.name.slice(0, -'.md'.length);
    const assetDir = path.join(dirPath, articleName);

    if (!fs.existsSync(assetDir) || !fs.statSync(assetDir).isDirectory()) {
      continue;
    }

    if (hasMarkdownFiles(assetDir)) {
      console.warn(`Skipping ambiguous asset directory with markdown files: ${assetDir}`);
      continue;
    }

    copyDirectory(assetDir, path.join(outputDir, basePath, articleName));
  }
}

if (!fs.existsSync(contentDir)) {
  console.log('No content directory found, skipping content assets sync.');
  process.exit(0);
}

fs.rmSync(outputDir, { recursive: true, force: true });
syncAssets(contentDir);
console.log(`Content assets synced to ${path.relative(rootDir, outputDir)}`);

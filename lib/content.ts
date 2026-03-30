import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDir = path.join(process.cwd(), 'content');

export interface ContentItem {
  slug: string;
  title: string;
  type: 'file' | 'folder';
  children?: ContentItem[];
  content?: string;
  data?: Record<string, any>;
}

export function getContentTree(): ContentItem[] {
  return readDirectory(contentDir, '');
}

function readDirectory(dirPath: string, basePath: string): ContentItem[] {
  const items: ContentItem[] = [];
  
  if (!fs.existsSync(dirPath)) {
    return items;
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const itemPath = path.join(dirPath, entry.name);
    const itemBasePath = path.join(basePath, entry.name);

    if (entry.isDirectory()) {
      const children = readDirectory(itemPath, itemBasePath);
      items.push({
        slug: itemBasePath,
        title: entry.name,
        type: 'folder',
        children,
      });
    } else if (entry.name.endsWith('.md')) {
      const fileName = entry.name.replace('.md', '');
      const fileContent = fs.readFileSync(itemPath, 'utf-8');
      const { data, content } = matter(fileContent);
      
      items.push({
        slug: path.join(basePath, fileName),
        title: data.title || fileName,
        type: 'file',
        content,
        data,
      });
    }
  }

  return items.sort((a, b) => {
    if (a.type === b.type) {
      return a.title.localeCompare(b.title);
    }
    return a.type === 'folder' ? -1 : 1;
  });
}

export function getContentBySlug(slug: string): { content: string; data: Record<string, any> } | null {
  const filePath = path.join(contentDir, `${slug}.md`);
  
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);

  return { content, data };
}

export function getBreadcrumb(slug: string): { name: string; path: string }[] {
  const parts = slug.split(path.sep).filter(Boolean);
  const breadcrumb: { name: string; path: string }[] = [];
  
  let currentPath = '';
  for (const part of parts) {
    currentPath = currentPath ? path.join(currentPath, part) : part;
    breadcrumb.push({
      name: part,
      path: currentPath,
    });
  }
  
  return breadcrumb;
}

export function getFolderContent(folderSlug: string): ContentItem[] | null {
  const tree = getContentTree();
  
  if (!folderSlug) {
    return tree;
  }
  
  function findFolder(items: ContentItem[], parts: string[]): ContentItem[] | null {
    if (parts.length === 0) {
      return items;
    }
    
    const [current, ...rest] = parts;
    
    for (const item of items) {
      const slugParts = item.slug.split('/').filter(Boolean);
      const itemName = slugParts[slugParts.length - 1];
      if (itemName === current) {
        if (rest.length === 0) {
          return item.type === 'folder' ? item.children || [] : null;
        }
        if (item.type === 'folder' && item.children) {
          return findFolder(item.children, rest);
        }
      }
    }
    
    return null;
  }
  
  const parts = folderSlug.split('/').filter(Boolean);
  return findFolder(tree, parts);
}

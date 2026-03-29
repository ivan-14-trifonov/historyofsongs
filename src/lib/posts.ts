import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const contentDirectory = path.join(process.cwd(), 'content');

export interface PostData {
  slug: string;
  category: string;
  title: string;
  date?: string;
  contentHtml: string;
  [key: string]: string | undefined;
}

export function getPostSlugs(): { category: string; slug: string }[] {
  const slugs: { category: string; slug: string }[] = [];

  function readDirRecursively(dir: string, relativePath: string = '') {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        readDirRecursively(fullPath, path.join(relativePath, file));
      } else if (file.endsWith('.md')) {
        const slug = file.replace(/\.md$/, '');
        slugs.push({
          category: relativePath || 'default',
          slug,
        });
      }
    }
  }

  readDirRecursively(contentDirectory);
  return slugs;
}

export function getPostData(category: string, slug: string): PostData {
  const fullPath = path.join(contentDirectory, category, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  const { data, content } = matter(fileContents);

  const processedContent = remark()
    .use(html)
    .processSync(content)
    .toString();

  return {
    slug,
    category,
    title: data.title || slug,
    date: data.date,
    contentHtml: processedContent,
    ...data,
  };
}

export function getAllPostsData(): PostData[] {
  const slugs = getPostSlugs();
  return slugs
    .map(({ category, slug }) => getPostData(category, slug))
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));
}

export function getCategories(): string[] {
  const slugs = getPostSlugs();
  return [...new Set(slugs.map((s) => s.category))];
}

export function getPostsByCategory(category: string): PostData[] {
  const slugs = getPostSlugs().filter((s) => s.category === category);
  return slugs
    .map(({ slug }) => getPostData(category, slug))
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));
}

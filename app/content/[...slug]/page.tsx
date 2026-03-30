import { getContentTree, getContentBySlug, getBreadcrumb } from '@/lib/content';
import Sidebar from '@/components/Sidebar';
import MarkdownContent from '@/components/MarkdownContent';
import Breadcrumb from '@/components/Breadcrumb';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export default async function ContentPage({ params }: PageProps) {
  const { slug } = await params;
  const slugPath = slug.map(decodeURIComponent).join('/');
  const contentTree = getContentTree();
  const content = getContentBySlug(slugPath);
  const breadcrumb = getBreadcrumb(slugPath);

  if (!content) {
    notFound();
  }

  return (
    <div className="content-article-page">
      <header className="page-header">
        <h1><a href="/">История песен</a></h1>
      </header>
      
      <div className="article-wrapper">
        <Sidebar items={contentTree} currentPath={slugPath} />
        <article className="article">
          <Breadcrumb items={breadcrumb} />
          <MarkdownContent content={content.content} />
        </article>
      </div>
      
      <footer className="page-footer">
        <p>© 2026 История песен</p>
      </footer>
    </div>
  );
}

export async function generateStaticParams() {
  const contentTree = getContentTree();
  const slugs: { slug: string[] }[] = [];

  function collectSlugs(items: any[], basePath: string[] = []) {
    for (const item of items) {
      if (item.type === 'file') {
        slugs.push({ slug: [...basePath, item.slug.split('/').pop()] });
      } else if (item.type === 'folder' && item.children) {
        collectSlugs(item.children, [...basePath, item.slug.split('/').pop()]);
      }
    }
  }

  collectSlugs(contentTree);
  return slugs;
}

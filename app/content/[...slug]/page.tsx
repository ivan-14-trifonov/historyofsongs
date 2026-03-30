import { getContentTree, getContentBySlug, getBreadcrumb } from '@/lib/content';
import Breadcrumb from '@/components/Breadcrumb';
import MarkdownContent from '@/components/MarkdownContent';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export default async function ContentPage({ params }: PageProps) {
  const { slug } = await params;
  const slugPath = slug.map(decodeURIComponent).join('/');
  const content = getContentBySlug(slugPath);
  const breadcrumb = getBreadcrumb(slugPath);

  if (!content) {
    notFound();
  }

  return (
    <div className="content-article-page">
      <header className="page-header">
        <h1><a href="/">Музыкальная литература МСЦ ЕХБ</a></h1>
        <p className="header-subtitle">База знаний</p>
      </header>
      
      <main className="article-main">
        <Breadcrumb items={breadcrumb} />
        <article className="article-content">
          <MarkdownContent content={content.content} />
        </article>
      </main>
      
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

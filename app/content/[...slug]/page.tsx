import { getContentTree, getContentBySlug, getBreadcrumb, getFolderContent } from '@/lib/content';
import Sidebar from '@/components/Sidebar';
import MarkdownContent from '@/components/MarkdownContent';
import Breadcrumb from '@/components/Breadcrumb';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export default async function ContentPage({ params }: PageProps) {
  const { slug } = await params;
  const slugPath = slug.join('/');
  const contentTree = getContentTree();
  const content = getContentBySlug(slugPath);
  const breadcrumb = getBreadcrumb(slugPath);

  // Если файл не найден, пробуем отобразить содержимое папки
  if (!content) {
    const folderItems = getFolderContent(slugPath);
    if (folderItems && folderItems.length > 0) {
      return (
        <div className="content-page">
          <Sidebar items={contentTree} currentPath={slugPath} />
          <article className="article">
            <Breadcrumb items={breadcrumb} />
            <h1>{breadcrumb.length > 0 ? breadcrumb[breadcrumb.length - 1].name : 'Главная'}</h1>
            <div className="folder-list">
              <h3>Файлы в этой папке:</h3>
              <ul>
                {folderItems.map((item) => (
                  <li key={item.slug}>
                    {item.type === 'folder' ? (
                      <Link href={`/content/${item.slug}`}>📁 {item.title}</Link>
                    ) : (
                      <Link href={`/content/${item.slug}`}>📄 {item.title}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </div>
      );
    }
    notFound();
  }

  return (
    <div className="content-page">
      <Sidebar items={contentTree} currentPath={slugPath} />
      <article className="article">
        <Breadcrumb items={breadcrumb} />
        <MarkdownContent content={content.content} />
      </article>
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

import { getContentTree, getFolderContent, getBreadcrumb } from '@/lib/content';
import Breadcrumb from '@/components/Breadcrumb';
import { notFound } from 'next/navigation';

interface FolderPageProps {
  params: Promise<{ slug: string[] }>;
}

export default async function FolderPage({ params }: FolderPageProps) {
  const { slug } = await params;
  const slugPath = slug.map(decodeURIComponent).join('/');
  const contentTree = getContentTree();
  const folderItems = getFolderContent(slugPath);
  const breadcrumb = getBreadcrumb(slugPath);

  if (folderItems === null) {
    notFound();
  }

  const folderName = breadcrumb.length > 0 ? breadcrumb[breadcrumb.length - 1].name : 'Главная';

  return (
    <div className="folder-page-content">
      <header className="page-header">
        <h1><a href="/">Музыкальная литература МСЦ ЕХБ</a></h1>
        <p className="header-subtitle">База знаний</p>
      </header>
      
      <main className="folder-main">
        <Breadcrumb items={breadcrumb} type="folder" />
        
        {folderItems.length > 0 ? (
          <div className="folder-list">
            <ul>
              {folderItems.map((item) => (
                <li key={item.slug}>
                  {item.type === 'folder' ? (
                    <a href={`/folder/${item.slug}`}>📁 {item.title}</a>
                  ) : (
                    <a href={`/content/${item.slug}`}>📄 {item.title}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="empty-folder">Эта папка пуста</p>
        )}
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

  function collectFolderSlugs(items: any[], basePath: string[] = []) {
    for (const item of items) {
      if (item.type === 'folder') {
        const folderName = item.slug.split('/').pop();
        if (folderName) {
          slugs.push({ slug: [...basePath, folderName] });
        }
        if (item.children) {
          collectFolderSlugs(item.children, [...basePath, folderName]);
        }
      }
    }
  }

  collectFolderSlugs(contentTree);
  return slugs;
}

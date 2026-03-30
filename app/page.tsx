import { getContentTree } from '@/lib/content';
import Sidebar from '@/components/Sidebar';

export default function Home() {
  const contentTree = getContentTree();

  return (
    <div className="home-page">
      <header className="page-header">
        <h1><a href="/">История песен</a></h1>
      </header>
      
      <main className="home-main">
        <div className="home">
          <h2>Добро пожаловать</h2>
          <p>Выберите материал в навигации слева.</p>
          
          {contentTree.length > 0 && (
            <div className="content-preview">
              <h3>Доступные разделы:</h3>
              <ul>
                {contentTree.map((item) => (
                  <li key={item.slug}>
                    {item.type === 'folder' ? (
                      <a href={`/folder/${item.slug}`}>{item.title}</a>
                    ) : (
                      <a href={`/content/${item.slug}`}>{item.title}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
      
      <footer className="page-footer">
        <p>© 2026 История песен</p>
      </footer>
    </div>
  );
}

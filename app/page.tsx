import { getContentTree } from '@/lib/content';
import Sidebar from '@/components/Sidebar';

export default function Home() {
  const contentTree = getContentTree();

  return (
    <div className="home-page">
      <header className="page-header">
        <h1><a href="/">Музыкальная литература МСЦ ЕХБ</a></h1>
        <p className="header-subtitle">База знаний</p>
      </header>
      
      <main className="home-main">
        <div className="home">
          <div className="quote-block">
            <blockquote>
              <p>Уважение к прошлому — вот черта, отличающая образованность от дикости.</p>
            </blockquote>
            <cite>
              Пушкин А. С. Наброски статьи о русской литературе // Полное собрание сочинений: В 16 т. — М.; Л.: Изд-во АН СССР, 1937—1959.
              Т. 11. — С. 184.
            </cite>
          </div>
          
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

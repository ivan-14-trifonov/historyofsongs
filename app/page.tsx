import { getContentTree } from '@/lib/content';
import Sidebar from '@/components/Sidebar';

export default function Home() {
  const contentTree = getContentTree();

  return (
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
                  <a href={`/content/${item.slug}`}>{item.title}</a>
                ) : (
                  <a href={`/content/${item.slug}`}>{item.title}</a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

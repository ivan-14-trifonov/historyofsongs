interface BreadcrumbProps {
  items: { name: string; path: string }[];
  type?: 'content' | 'folder';
}

export default function Breadcrumb({ items, type = 'content' }: BreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <nav className="breadcrumb">
      <a href="/">Главная</a>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        // Все элементы кроме последнего - это папки, ссылаются на /folder/
        // Последний элемент использует переданный type
        const prefix = isLast ? type : 'folder';
        return (
          <span key={item.path}>
            {' / '}
            {isLast ? (
              <span>{item.name}</span>
            ) : (
              <a href={`/folder/${item.path}`}>{item.name}</a>
            )}
          </span>
        );
      })}
    </nav>
  );
}

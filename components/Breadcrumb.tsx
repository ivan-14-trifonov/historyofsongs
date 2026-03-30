interface BreadcrumbProps {
  items: { name: string; path: string }[];
  type?: 'content' | 'folder';
}

export default function Breadcrumb({ items, type = 'content' }: BreadcrumbProps) {
  if (items.length === 0) return null;

  const prefix = type === 'folder' ? 'folder' : 'content';

  return (
    <nav className="breadcrumb">
      <a href="/">Главная</a>
      {items.map((item, index) => (
        <span key={item.path}>
          {' / '}
          <a href={`/${prefix}/${item.path}`}>{item.name}</a>
        </span>
      ))}
    </nav>
  );
}

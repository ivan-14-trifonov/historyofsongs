interface BreadcrumbProps {
  items: { name: string; path: string }[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <nav className="breadcrumb">
      <a href="/">Главная</a>
      {items.map((item, index) => (
        <span key={item.path}>
          {' / '}
          <a href={`/content/${item.path}`}>{item.name}</a>
        </span>
      ))}
    </nav>
  );
}

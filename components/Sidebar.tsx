'use client';

import Link from 'next/link';
import { ContentItem } from '@/lib/content';

interface SidebarProps {
  items: ContentItem[];
  currentPath?: string;
}

export default function Sidebar({ items, currentPath }: SidebarProps) {
  return (
    <nav className="sidebar">
      <h2>Навигация</h2>
      <ul>
        {items.map((item) => (
          <li key={item.slug}>
            {item.type === 'folder' ? (
              <FolderItem item={item} currentPath={currentPath} />
            ) : (
              <FileItem item={item} currentPath={currentPath} />
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

function FolderItem({ item, currentPath }: { item: ContentItem; currentPath?: string }) {
  const isActive = currentPath?.startsWith(item.slug);
  
  return (
    <div className={`folder ${isActive ? 'active' : ''}`}>
      <a href={`/folder/${item.slug}`} className={isActive ? 'active' : ''}><strong>{item.title}</strong></a>
      {item.children && item.children.length > 0 && (
        <ul>
          {item.children.map((child) => (
            <li key={child.slug}>
              {child.type === 'folder' ? (
                <FolderItem item={child} currentPath={currentPath} />
              ) : (
                <FileItem item={child} currentPath={currentPath} />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FileItem({ item, currentPath }: { item: ContentItem; currentPath?: string }) {
  const href = `/content/${item.slug}`;
  const isActive = currentPath === item.slug;
  
  return (
    <a href={href} className={isActive ? 'active' : ''}>
      {item.title}
    </a>
  );
}

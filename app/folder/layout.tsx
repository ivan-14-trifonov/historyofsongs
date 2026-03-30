import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Папка - История песен',
};

export default function FolderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="folder-page">
      {children}
    </div>
  );
}

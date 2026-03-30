import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Статья - История песен',
};

export default function ContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

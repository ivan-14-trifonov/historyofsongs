import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'История Песен',
  description: 'Истории христианских песен и их авторов',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <a href="/" className="text-2xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
              История Песен
            </a>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
          <div className="max-w-4xl mx-auto px-4 py-6 text-center text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} История Песен
          </div>
        </footer>
      </body>
    </html>
  );
}

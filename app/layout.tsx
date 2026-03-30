import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'История песен',
  description: 'История христианских песен',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <div className="container">
          <header>
            <h1><a href="/">История песен</a></h1>
          </header>
          <main>{children}</main>
          <footer>
            <p>© 2026 История песен</p>
          </footer>
        </div>
      </body>
    </html>
  );
}

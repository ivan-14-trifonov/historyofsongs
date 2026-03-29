import { getCategories, getPostsByCategory } from '@/lib/posts';
import Link from 'next/link';

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  const categories = getCategories();
  return categories.map((category) => ({
    category: encodeURIComponent(category),
  }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);
  const posts = getPostsByCategory(decodedCategory);

  return (
    <div>
      <nav className="mb-6">
        <Link
          href="/"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← На главную
        </Link>
      </nav>

      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        Категория: {decodedCategory}
      </h1>

      {posts.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">
          В этой категории пока нет материалов.
        </p>
      ) : (
        <ul className="space-y-4">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/${encodeURIComponent(post.category)}/${post.slug}`}
                className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {post.title}
                </h2>
                {post.date && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {post.date}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

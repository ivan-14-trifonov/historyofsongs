import { getAllPostsData, getCategories } from '@/lib/posts';
import Link from 'next/link';

export default function Home() {
  const allPosts = getAllPostsData();
  const categories = getCategories();

  return (
    <div>
      <section className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Добро пожаловать в Историю Песен
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Коллекция историй христианских песен и их авторов
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Категории
        </h2>
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <Link
              key={category}
              href={`/${encodeURIComponent(category)}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {category}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Все материалы
        </h2>
        {allPosts.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">
            Материалы пока не добавлены.
          </p>
        ) : (
          <ul className="space-y-4">
            {allPosts.map((post) => (
              <li key={`${post.category}-${post.slug}`}>
                <Link
                  href={`/${encodeURIComponent(post.category)}/${encodeURIComponent(post.slug)}`}
                  className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Категория: {post.category}
                  </p>
                  {post.date && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {post.date}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

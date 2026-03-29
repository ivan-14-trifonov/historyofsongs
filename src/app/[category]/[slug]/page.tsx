import { getPostSlugs, getPostData } from '@/lib/posts';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PostPageProps {
  params: Promise<{ category: string; slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getPostSlugs();
  return slugs.map(({ category, slug }) => ({
    category: encodeURIComponent(category),
    slug: encodeURIComponent(slug),
  }));
}

export default async function PostPage({ params }: PostPageProps) {
  const { category, slug } = await params;
  const decodedCategory = decodeURIComponent(category);
  const decodedSlug = decodeURIComponent(slug);

  let post;
  try {
    post = getPostData(decodedCategory, decodedSlug);
  } catch {
    notFound();
  }

  return (
    <article>
      <nav className="mb-6">
        <Link
          href={`/${encodeURIComponent(category)}`}
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← Назад к категории
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <Link
          href="/"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          На главную
        </Link>
      </nav>

      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {post.title}
        </h1>
        {post.date && (
          <p className="text-gray-500 dark:text-gray-400">{post.date}</p>
        )}
      </header>

      <div
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />
    </article>
  );
}

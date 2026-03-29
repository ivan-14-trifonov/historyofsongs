export default function NotFound() {
  return (
    <div className="text-center py-12">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        404
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Страница не найдена
      </p>
      <a
        href="/"
        className="text-blue-600 dark:text-blue-400 hover:underline"
      >
        Вернуться на главную
      </a>
    </div>
  );
}

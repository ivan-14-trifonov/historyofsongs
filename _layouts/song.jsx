// Шаблон для страницы песни/истории
export default function SongLayout({ title, content }) {
  return `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 min-h-screen">
  <div class="max-w-3xl mx-auto px-4 py-8">
    <nav class="mb-8">
      <a href="/" class="text-blue-600 hover:underline">← На главную</a>
    </nav>
    <article class="bg-white rounded-lg shadow-md p-8">
      <h1 class="text-3xl font-bold mb-6 text-gray-900">${title}</h1>
      <div class="prose prose-lg max-w-none text-gray-700">
        ${content}
      </div>
    </article>
  </div>
</body>
</html>
  `.trim();
}

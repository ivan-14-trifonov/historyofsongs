import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

const CONTENT_DIR = path.join(process.cwd(), 'content');
const OUTPUT_DIR = path.join(process.cwd(), 'dist');
const LAYOUTS_DIR = path.join(process.cwd(), '_layouts');

// Базовый шаблон по умолчанию
const defaultLayout = (title: string, content: string) => `
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
`;

// Главная страница
const indexLayout = (items: Array<{ title: string; url: string }>) => `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>History of Songs</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 min-h-screen">
  <div class="max-w-4xl mx-auto px-4 py-12">
    <h1 class="text-4xl font-bold mb-8 text-gray-900">History of Songs</h1>
    <div class="grid gap-4">
      ${items.map(item => `
        <a href="${item.url}" class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <h2 class="text-xl font-semibold text-blue-600">${item.title}</h2>
        </a>
      `).join('')}
    </div>
  </div>
</body>
</html>
`;

function getLayout(layoutName: string): ((title: string, content: string) => string) | null {
  if (!layoutName) return null;
  
  const layoutPath = path.join(LAYOUTS_DIR, `${layoutName}.jsx`);
  if (fs.existsSync(layoutPath)) {
    // Для простоты пока используем дефолтный шаблон
    // В будущем можно подключить JSX рендеринг
    return defaultLayout;
  }
  return null;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function processMarkdown(filePath: string, relativePath: string): { html: string; title: string; url: string } | null {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);
  
  const title = data.title || path.basename(filePath, '.md');
  const layout = data.layout;
  
  const htmlContent = marked(content) as string;
  
  const layoutFn = layout ? getLayout(layout) : null;
  const html = (layoutFn || defaultLayout)(title, htmlContent);
  
  // Генерируем URL из пути файла
  const url = relativePath
    .replace('.md', '.html')
    .replace(/\\/g, '/');
  
  return { html, title, url };
}

function collectMarkdownFiles(dir: string, baseDir: string): Array<{ path: string; relativePath: string }> {
  const files: Array<{ path: string; relativePath: string }> = [];
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    // Пропускаем файлы и папки, начинающиеся с _
    if (entry.name.startsWith('_')) continue;
    
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      files.push(...collectMarkdownFiles(fullPath, baseDir));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const relativePath = path.relative(baseDir, fullPath);
      files.push({ path: fullPath, relativePath });
    }
  }
  
  return files;
}

function build() {
  // Очищаем output директорию
  if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true });
  }
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  
  // Собираем все Markdown файлы
  const mdFiles = collectMarkdownFiles(CONTENT_DIR, CONTENT_DIR);
  const navItems: Array<{ title: string; url: string }> = [];
  
  console.log(`Найдено ${mdFiles.length} Markdown файлов`);
  
  for (const file of mdFiles) {
    const result = processMarkdown(file.path, file.relativePath);
    if (!result) continue;
    
    navItems.push({ title: result.title, url: result.url });
    
    // Создаем директорию для файла
    const outputPath = path.join(OUTPUT_DIR, file.relativePath.replace('.md', '.html'));
    const outputDir = path.dirname(outputPath);
    fs.mkdirSync(outputDir, { recursive: true });
    
    // Записываем HTML
    fs.writeFileSync(outputPath, result.html, 'utf-8');
    console.log(`Сгенерировано: ${file.relativePath} → ${result.url}`);
  }
  
  // Генерируем главную страницу
  const indexHtml = indexLayout(navItems.sort((a, b) => a.title.localeCompare(b.title)));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), indexHtml, 'utf-8');
  console.log('Сгенерировано: index.html');
  
  console.log(`\nСборка завершена! Output: ${OUTPUT_DIR}`);
}

build();

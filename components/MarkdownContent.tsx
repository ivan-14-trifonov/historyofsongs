import type { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownContentProps {
  content: string;
  assetBasePath?: string;
}

function isExternalAssetPath(src: string): boolean {
  return /^(?:[a-z][a-z0-9+.-]*:|\/)/i.test(src);
}

function resolveAssetPath(src: string, assetBasePath?: string): string {
  if (!assetBasePath || !src || isExternalAssetPath(src)) {
    return src;
  }

  return `${assetBasePath}/${encodeAssetPath(src)}`;
}

function encodeAssetPath(src: string): string {
  return src
    .split('/')
    .filter(Boolean)
    .map(encodeURIComponent)
    .join('/');
}

function getTextFromChildren(children: ReactNode): string {
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children);
  }

  if (Array.isArray(children)) {
    return children.map(getTextFromChildren).join('');
  }

  return '';
}

export default function MarkdownContent({ content, assetBasePath }: MarkdownContentProps) {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          img: ({ src = '', alt = '', ...props }) => {
            const imageSrc = resolveAssetPath(src, assetBasePath);
            return <img src={imageSrc} alt={alt} loading="lazy" {...props} />;
          },
          a: ({ href = '', children, ...props }) => {
            const text = getTextFromChildren(children);
            const audioMatch = text.match(/^audio:\s*(.+)$/i);

            if (audioMatch) {
              const label = audioMatch[1].trim();
              const audioSrc = resolveAssetPath(href, assetBasePath);

              return (
                <span className="markdown-audio">
                  <audio controls preload="metadata" src={audioSrc}>
                    <a href={audioSrc}>{label}</a>
                  </audio>
                  {label && <span className="markdown-audio-caption">{label}</span>}
                </span>
              );
            }

            return <a href={href} {...props}>{children}</a>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

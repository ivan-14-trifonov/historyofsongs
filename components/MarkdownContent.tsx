import type { ReactNode } from 'react';
import { cloneElement, isValidElement } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownContentProps {
  content: string;
  assetBasePath?: string;
}

const spoilerHref = '#markdown-spoiler';
const alertConfig = {
  note: 'Примечание',
  tip: 'Совет',
  important: 'Важно',
  warning: 'Внимание',
  caution: 'Осторожно',
} as const;

type AlertType = keyof typeof alertConfig;

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

  if (isValidElement<{ children?: ReactNode }>(children)) {
    return getTextFromChildren(children.props.children);
  }

  return '';
}

function stripAudioPrefix(children: ReactNode): ReactNode {
  let stripped = false;

  function stripNode(node: ReactNode): ReactNode {
    if (stripped) {
      return node;
    }

    if (typeof node === 'string' || typeof node === 'number') {
      const text = String(node);
      const nextText = text.replace(/^audio:\s*/i, '');

      if (nextText !== text) {
        stripped = true;
      }

      return nextText;
    }

    if (Array.isArray(node)) {
      return node.map(stripNode);
    }

    if (isValidElement<{ children?: ReactNode }>(node)) {
      return cloneElement(node, undefined, stripNode(node.props.children));
    }

    return node;
  }

  return stripNode(children);
}

function getAlertType(children: ReactNode): AlertType | null {
  const match = getTextFromChildren(children).trimStart().match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i);
  return match ? match[1].toLowerCase() as AlertType : null;
}

function stripAlertMarker(children: ReactNode): ReactNode {
  let stripped = false;

  function stripNode(node: ReactNode): ReactNode {
    if (stripped) {
      return node;
    }

    if (typeof node === 'string' || typeof node === 'number') {
      const text = String(node);
      const nextText = text.replace(/^\s*\[!(?:NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i, '');

      if (nextText !== text) {
        stripped = true;
      }

      return nextText;
    }

    if (Array.isArray(node)) {
      return node.map(stripNode);
    }

    if (isValidElement<{ children?: ReactNode }>(node)) {
      return cloneElement(node, undefined, stripNode(node.props.children));
    }

    return node;
  }

  return stripNode(children);
}

function escapeMarkdownLinkText(text: string): string {
  return text.replace(/([\\[\]])/g, '\\$1');
}

function renderSpoilers(content: string): string {
  return content.replace(/(?<!\\)\|\|([\s\S]+?)(?<!\\)\|\|/g, (_, text: string) => {
    return `[${escapeMarkdownLinkText(text)}](${spoilerHref})`;
  });
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
          blockquote: ({ children }) => {
            const alertType = getAlertType(children);

            if (alertType) {
              return (
                <div className={`markdown-alert markdown-alert-${alertType}`}>
                  <div className="markdown-alert-title">{alertConfig[alertType]}</div>
                  <div className="markdown-alert-content">{stripAlertMarker(children)}</div>
                </div>
              );
            }

            return <blockquote>{children}</blockquote>;
          },
          a: ({ href = '', children, ...props }) => {
            const text = getTextFromChildren(children);
            const audioMatch = text.match(/^audio:\s*(.+)$/i);

            if (audioMatch) {
              const label = audioMatch[1].trim();
              const caption = stripAudioPrefix(children);
              const audioSrc = resolveAssetPath(href, assetBasePath);

              return (
                <span className="markdown-audio">
                  {label && <span className="markdown-audio-caption">{caption}</span>}
                  <audio controls preload="metadata" src={audioSrc}>
                    <a href={audioSrc}>{label}</a>
                  </audio>
                </span>
              );
            }

            if (href === spoilerHref) {
              return (
                <label className="markdown-spoiler-control">
                  <input className="markdown-spoiler-toggle" type="checkbox" />
                  <span className="markdown-spoiler">{children}</span>
                </label>
              );
            }

            return <a href={href} {...props}>{children}</a>;
          },
        }}
      >
        {renderSpoilers(content)}
      </ReactMarkdown>
    </div>
  );
}

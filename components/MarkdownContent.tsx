import type { ReactNode } from 'react';
import { Children, cloneElement, isValidElement } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownContentProps {
  content: string;
  assetBasePath?: string;
}

const spoilerHref = '#markdown-spoiler';
const alertTypes = ['note', 'tip', 'important', 'warning', 'caution'] as const;
const SOURCES_SECTION_TITLE = 'Источники';
const sourcesSectionClassName = 'markdown-sources-section';

type AlertType = typeof alertTypes[number];
type MarkdownNode = {
  type: string;
  value?: string;
  depth?: number;
  children?: MarkdownNode[];
  data?: {
    hProperties?: {
      className?: string | string[];
    };
  };
};

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

function getMarkdownNodeText(node: MarkdownNode): string {
  if (typeof node.value === 'string') {
    return node.value;
  }

  return node.children?.map(getMarkdownNodeText).join('') ?? '';
}

function addSourcesSectionClass(node: MarkdownNode): void {
  const properties = node.data?.hProperties;
  const existingClassName = properties?.className;
  const classNames = Array.isArray(existingClassName)
    ? existingClassName
    : existingClassName
      ? [existingClassName]
      : [];

  node.data = {
    ...node.data,
    hProperties: {
      ...properties,
      className: [...classNames, sourcesSectionClassName],
    },
  };
}

function remarkMarkSourcesSection() {
  return (tree: MarkdownNode) => {
    let sourcesHeadingDepth: number | null = null;

    for (const node of tree.children ?? []) {
      if (node.type === 'heading' && typeof node.depth === 'number') {
        if (sourcesHeadingDepth !== null && node.depth <= sourcesHeadingDepth) {
          sourcesHeadingDepth = null;
        }

        if (getMarkdownNodeText(node).trim() === SOURCES_SECTION_TITLE) {
          sourcesHeadingDepth = node.depth;
        }
      }

      if (sourcesHeadingDepth !== null) {
        addSourcesSectionClass(node);
      }
    }
  };
}

function renderBracketedText(children: ReactNode): ReactNode {
  if (typeof children === 'string' || typeof children === 'number') {
    const text = String(children);
    const parts = text.split(/(\[[^\]\n]+\])/g);

    if (parts.length === 1) {
      return children;
    }

    return parts.map((part, index) => (
      /^\[[^\]\n]+\]$/.test(part)
        ? <sup className="markdown-bracketed-text" key={index}>{part}</sup>
        : part
    ));
  }

  if (Array.isArray(children)) {
    return children.map(renderBracketedText);
  }

  return children;
}

function renderParagraph(children: ReactNode, className?: string, assetBasePath?: string): ReactNode {
  const childNodes = Children.toArray(children);

  if (childNodes.length === 1) {
    const child = childNodes[0];

    if (
      isValidElement<{
        src?: string;
        alt?: string;
        node?: { tagName?: string };
      }>(child)
      && (child.type === 'img' || child.props.node?.tagName === 'img')
    ) {
      const src = resolveAssetPath(child.props.src ?? '', assetBasePath);
      const alt = child.props.alt ?? '';
      const captionSeparatorIndex = alt.indexOf(':');
      const caption = captionSeparatorIndex >= 0
        ? alt.slice(captionSeparatorIndex + 1).trim()
        : '';

      if (caption) {
        const imageAlt = alt.slice(0, captionSeparatorIndex).trim();

        return (
          <figure className={`markdown-image ${className ?? ''}`.trim()}>
            <img src={src} alt={imageAlt} loading="lazy" />
            <figcaption className="markdown-audio-caption">{caption}</figcaption>
          </figure>
        );
      }
    }

    if (
      isValidElement<{ node?: { tagName?: string } }>(child)
      && (child.type === 'a' || child.props.node?.tagName === 'a')
    ) {
      return (
        <p className={`markdown-link-paragraph ${className ?? ''}`.trim()}>
          {child}
        </p>
      );
    }
  }

  return <p className={className}>{renderBracketedText(children)}</p>;
}

export default function MarkdownContent({ content, assetBasePath }: MarkdownContentProps) {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMarkSourcesSection]}
        components={{
          p: ({ children, className }) => renderParagraph(children, className, assetBasePath),
          h1: ({ children, className }) => <h1 className={className}>{renderBracketedText(children)}</h1>,
          h2: ({ children, className }) => <h2 className={className}>{renderBracketedText(children)}</h2>,
          h3: ({ children, className }) => <h3 className={className}>{renderBracketedText(children)}</h3>,
          h4: ({ children, className }) => <h4 className={className}>{renderBracketedText(children)}</h4>,
          h5: ({ children, className }) => <h5 className={className}>{renderBracketedText(children)}</h5>,
          h6: ({ children, className }) => <h6 className={className}>{renderBracketedText(children)}</h6>,
          li: ({ children }) => <li>{renderBracketedText(children)}</li>,
          td: ({ children }) => <td>{renderBracketedText(children)}</td>,
          th: ({ children }) => <th>{renderBracketedText(children)}</th>,
          img: ({ node: _node, src = '', alt = '', ...props }) => {
            const imageSrc = resolveAssetPath(src, assetBasePath);
            return <img src={imageSrc} alt={alt} loading="lazy" {...props} />;
          },
          blockquote: ({ children, className }) => {
            const alertType = getAlertType(children);

            if (alertType) {
              return (
                <div className={`markdown-alert markdown-alert-${alertType} ${className ?? ''}`.trim()}>
                  <div className="markdown-alert-content">{stripAlertMarker(children)}</div>
                </div>
              );
            }

            return <blockquote className={className}>{children}</blockquote>;
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

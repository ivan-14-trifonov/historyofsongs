import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownContentProps {
  content: string;
  assetBasePath?: string;
}

function isExternalImagePath(src: string): boolean {
  return /^(?:[a-z][a-z0-9+.-]*:|\/)/i.test(src);
}

function encodeAssetPath(src: string): string {
  return src
    .split('/')
    .filter(Boolean)
    .map(encodeURIComponent)
    .join('/');
}

export default function MarkdownContent({ content, assetBasePath }: MarkdownContentProps) {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          img: ({ src = '', alt = '', ...props }) => {
            const imageSrc =
              assetBasePath && src && !isExternalImagePath(src)
                ? `${assetBasePath}/${encodeAssetPath(src)}`
                : src;

            return <img src={imageSrc} alt={alt} loading="lazy" {...props} />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

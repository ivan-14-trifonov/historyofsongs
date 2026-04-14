interface SourcesBadgeProps {
  sources?: string;
}

type SourcesKey = 'достоверные_источники' | 'источники_указаны' | 'источники_не_указаны';

const sourcesConfig: Record<SourcesKey, { label: string; className: string; icon: React.ReactNode }> = {
  достоверные_источники: {
    label: 'Достоверные источники',
    className: 'sources-badge sources-badge--verified',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  источники_указаны: {
    label: 'Источники указаны',
    className: 'sources-badge sources-badge--partial',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  источники_не_указаны: {
    label: 'Источники не указаны',
    className: 'sources-badge sources-badge--unverified',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2"/>
        <path d="M8 5V8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
};

export default function SourcesBadge({ sources }: SourcesBadgeProps) {
  if (!sources || !sourcesConfig[sources as SourcesKey]) {
    return null;
  }

  const config = sourcesConfig[sources as SourcesKey];

  return (
    <span className={config.className}>
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
}

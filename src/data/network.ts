export type NetworkLink = { label: string; url: string };

export const newsletter = {
  url: 'https://amdatalakehouse.substack.com',
  editions: [
    {
      day: 'Thursday',
      title: 'AI newsletter',
      note: 'Model releases, agent tooling, protocols, and AI infrastructure from the past week.',
    },
    {
      day: 'Friday',
      title: 'Apache lakehouse newsletter',
      note: 'What moved on the Apache Iceberg, Polaris, Arrow, and Parquet dev lists.',
    },
  ],
};

export const communityLinks: NetworkLink[] = [
  { label: 'Data Lakehouse Hub Slack', url: 'https://join.slack.com/t/thedatalakehousehub/shared_invite/zt-274yc8sza-mI2zhCW8LGkOh1uxuf8T5Q' },
  { label: 'Data Lakehouse Hub events', url: 'https://luma.com/DataLakehouseHub' },
  { label: 'Agentic Lakehouse events', url: 'https://luma.com/agenticlakehouse' },
  { label: 'r/datalakehouseandai', url: 'https://www.reddit.com/r/datalakehouseandai/' },
  { label: 'Dremio developer community', url: 'https://developer.dremio.com' },
];

export const connectLinks: NetworkLink[] = [
  { label: 'Spotify, music', url: 'https://open.spotify.com/artist/7saFKAusZMQg0PnHcO8zm6' },
  { label: 'GitHub', url: 'https://github.com/alexmercedcoder' },
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/alexmerced' },
  { label: 'BlueSky', url: 'https://bsky.app/profile/alextalksdatalakehouses.fyi' },
  { label: 'Twitter/X', url: 'https://x.com/AMdatalakehouse' },
  { label: 'YouTube, data and AI', url: 'https://www.youtube.com/@alexmerceddata' },
  { label: 'YouTube, tech', url: 'https://www.youtube.com/@AlexMercedCoder' },
  { label: 'YouTube, music', url: 'https://www.youtube.com/@AlexMercedMusic' },
  { label: 'Email', url: 'mailto:contact@alexmerced.com' },
];

export const TRADEMARK_NOTICE =
  'Apache Iceberg, Apache Polaris, Apache Parquet, Apache Arrow, and Apache Ossie are trademarks of the Apache Software Foundation. This site is independent and is not affiliated with or endorsed by the ASF. Project names describe subject matter only.';

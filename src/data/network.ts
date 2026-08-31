export type NetworkLink = { label: string; url: string };
export type NetworkGroup = { title: string; links: NetworkLink[] };

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

export const networkGroups: NetworkGroup[] = [
  {
    title: 'Lakehouse and data',
    links: [
      { label: 'OpenDataLakehouse.com', url: 'https://opendatalakehouse.com' },
      { label: 'SemanticLakehouse.com', url: 'https://semanticlakehouse.com' },
      { label: 'IcebergLakehouse.com', url: 'https://iceberglakehouse.com' },
      { label: 'AgenticLakehouse.com', url: 'https://agenticlakehouse.com' },
      { label: 'AgenticAnalyticsNow.com', url: 'https://agenticanalyticsnow.com' },
      { label: 'DataLakehouseHub.com', url: 'https://datalakehousehub.com' },
      { label: 'DataLakehouse.help', url: 'https://datalakehouse.help' },
      { label: 'DataEngnr.com', url: 'https://dataengnr.com' },
      { label: 'DataAIWiki.com', url: 'https://dataaiwiki.com' },
      { label: 'WeekOfData.com', url: 'https://weekofdata.com' },
    ],
  },
  {
    title: 'AI and agents',
    links: [
      { label: 'AlexMercedAI.com', url: 'https://www.alexmercedai.com' },
      { label: 'OpenAgenticPlatform.com', url: 'https://openagenticplatform.com' },
    ],
  },
  {
    title: 'Identity and work',
    links: [
      { label: 'AlexMerced.com', url: 'https://alexmerced.com' },
      { label: 'WhoIsAlexMerced.com', url: 'https://whoisalexmerced.com' },
      { label: 'AlexMercedCoder.dev', url: 'https://alexmercedcoder.dev' },
      { label: 'AlexMercedData.com', url: 'https://alexmerceddata.com' },
      { label: 'AlexMercedMedia.com', url: 'https://alexmercedmedia.com' },
      { label: 'AlexMercedMusic.com', url: 'https://alexmercedmusic.com' },
      { label: 'Books by Alex Merced', url: 'https://books.alexmerced.com' },
      { label: 'Resources', url: 'https://resources.alexmerced.com' },
    ],
  },
  {
    title: 'Writing',
    links: [
      { label: 'AlexMerced.blog', url: 'https://alexmerced.blog' },
      { label: 'GrokOverflow.com', url: 'https://grokoverflow.com' },
      { label: 'IngestThis.com', url: 'https://ingestthis.com' },
      { label: 'Coding tutorials', url: 'https://tuts.alexmercedcoder.dev' },
    ],
  },
];

export const communityLinks: NetworkLink[] = [
  { label: 'Data Lakehouse Hub Slack', url: 'https://join.slack.com/t/thedatalakehousehub/shared_invite/zt-274yc8sza-mI2zhCW8LGkOh1uxuf8T5Q' },
  { label: 'Data Lakehouse Hub events', url: 'https://luma.com/DataLakehouseHub' },
  { label: 'Agentic Lakehouse events', url: 'https://luma.com/agenticlakehouse' },
  { label: 'r/datalakehouseandai', url: 'https://www.reddit.com/r/datalakehouseandai/' },
  { label: 'Dremio developer community', url: 'https://developer.dremio.com' },
];

export const connectLinks: NetworkLink[] = [
  { label: 'GitHub', url: 'https://github.com/alexmercedcoder' },
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/alexmerced' },
  { label: 'BlueSky', url: 'https://bsky.app/profile/alextalksdatalakehouses.fyi' },
  { label: 'Twitter/X', url: 'https://x.com/AMdatalakehouse' },
  { label: 'YouTube, data and AI', url: 'https://www.youtube.com/@alexmerceddata' },
  { label: 'YouTube, tech', url: 'https://www.youtube.com/@AlexMercedCoder' },
  { label: 'YouTube, music', url: 'https://www.youtube.com/@AlexMercedMusic' },
  { label: 'Email', url: 'mailto:dev@alexmerced.com' },
];

export const TRADEMARK_NOTICE =
  'Apache Iceberg, Apache Polaris, Apache Parquet, Apache Arrow, and Apache Ossie are trademarks of the Apache Software Foundation. This site is independent and is not affiliated with or endorsed by the ASF. Project names describe subject matter only.';

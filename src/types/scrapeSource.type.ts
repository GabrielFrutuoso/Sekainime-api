export type SourceRoute = {
  route: string;
  queryParams?: Record<string, string>;
};

export type ScrapeSelectors = {
  cardList: string;
  name: string;
  poster: string;
  paginationLinks: string;
};

export type ScrapePagination = {
  type: "path" | "query";
  paramName?: string;
  separator?: string;
};

export type InfosSelectors = {
  name: string;
  orientalName: string;
  japaneseName: string;
  poster: string;
  synopsis: string;
  episodes: string;
};

export type EpisodeSelectors = {
  videoSource: string;
};

export type EpisodeConfig = {
  route: string;
  selectors: EpisodeSelectors;
  videoExtraction: "video" | "iframe";
  iframeIndex?: number;
};

export type SearchConfig = {
  route: string;
  queryParams?: Record<string, string>;
  pagination: ScrapePagination;
  selectors: ScrapeSelectors;
};

export type ScrapeSource = {
  baseUrl: string;
  routes: Record<string, SourceRoute>;
  home: {
    pagination: ScrapePagination;
    selectors: ScrapeSelectors;
  };
  search: SearchConfig;
  infos: {
    route: string;
    selectors: InfosSelectors;
  };
  episode: EpisodeConfig;
};

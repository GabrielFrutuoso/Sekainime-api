import { AnimeInfos } from "../../types/anime.type";
import { ScrapeSource } from "../../types/scrapeSource.type";
import { scrapeAnimeInfosFromSource } from "../../utils/scraper/scrapeAnimeInfosFromSource";

export const getAnimeInfos = async (
  sources: ScrapeSource[],
  anime: string,
): Promise<AnimeInfos | null> => {
  const results = await Promise.all(
    sources.map((source) =>
      scrapeAnimeInfosFromSource(source, anime).catch(() => null),
    ),
  );

  const validResults = results.filter((r): r is AnimeInfos => r !== null);

  if (validResults.length === 0) return null;

  return validResults.reduce((best, current) =>
    current.episodes.length > best.episodes.length ? current : best,
  );
};

import { AnimePromise } from "../../types/anime.type";
import { ScrapeSource } from "../../types/scrapeSource.type";
import { scrapeSearchFromSource } from "../../utils/scraper/scrapeSearchFromSource";

export const searchAnimes = async (
  sources: ScrapeSource[],
  param: string,
  pageIndex: number | null = 1,
): Promise<AnimePromise | null> => {
  const page = pageIndex || 1;

  const results = await Promise.all(
    sources.map((source) =>
      scrapeSearchFromSource(source, param, page).catch(() => null),
    ),
  );

  const validResults = results.filter((r): r is AnimePromise => r !== null);

  if (validResults.length === 0) return null;

  const combinedAnimes = validResults.flatMap((r) => r.animes);

  const seenNames = new Set<string>();
  const processedAnimes = combinedAnimes.map((anime) => ({
    ...anime,
    name: anime.name.replace(/\(dublado\)/gi, "dublado"),
  }));
  const uniqueAnimes = processedAnimes.filter((anime) => {
    const lowerName = anime.name.toLowerCase().replace(/\s+/g, " ").trim();
    if (seenNames.has(lowerName)) return false;
    seenNames.add(lowerName);
    return true;
  });

  if (uniqueAnimes.length === 0) return null;

  return {
    animes: uniqueAnimes,
    pagination: {
      currentPage: page,
      lastPage: Math.max(...validResults.map((r) => r.pagination.lastPage)),
      totalElements: uniqueAnimes.length,
    },
  };
};

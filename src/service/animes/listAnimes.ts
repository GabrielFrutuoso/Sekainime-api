import { AnimePromise } from "../../types/anime.type";
import { ScrapeSource } from "../../types/scrapeSource.type";
import { scrapeAnimesFromSource } from "../../utils/scraper/scrapeAnimesFromSource";

export const listAnimes = async (
  sources: ScrapeSource[],
  category: string,
  page: number = 1,
): Promise<AnimePromise | null> => {
  const results = await Promise.all(
    sources.map((source) => scrapeAnimesFromSource(source, category, page)),
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
    const lowerName = anime.name.toLowerCase().trim();
    if (seenNames.has(lowerName)) return false;
    seenNames.add(lowerName);
    return true;
  });

  return {
    animes: uniqueAnimes,
    pagination: {
      currentPage: page,
      lastPage: Math.max(...validResults.map((r) => r.pagination.lastPage)),
      totalElements: uniqueAnimes.length,
    },
  };
};

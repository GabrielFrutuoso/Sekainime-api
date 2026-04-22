import { AnimePromise } from "../../types/anime.type";
import { searchAnimesFromAnimesFire } from "../../utils/searchAnimes/searchAnimesFromAnimesFire";
import { searchFromAnimesOnline } from "../../utils/searchAnimes/searchFromAnimesOnline";

export const searchAnimes = async (
  param: string,
  pageIndex: number | null = 1,
): Promise<AnimePromise | null> => {
  const [resultFire, resultOnline] = await Promise.all([
    searchAnimesFromAnimesFire(param, pageIndex),
    searchFromAnimesOnline(param, pageIndex),
  ]);

  if (!resultFire && !resultOnline) return null;

  const combinedAnimes = [
    ...(resultFire?.animes || []),
    ...(resultOnline?.animes || []),
  ];

  const seenNames = new Set<string>();
  const uniqueAnimes = combinedAnimes.filter((anime) => {
    const lowerName = anime.name.toLowerCase().trim();
    if (seenNames.has(lowerName)) return false; 
    seenNames.add(lowerName);
    return true;
  });

  if (uniqueAnimes.length === 0) return null;

  return {
    animes: uniqueAnimes,
    pagination: {
      currentPage: pageIndex || 1,
      lastPage: Math.max(
        resultFire?.pagination?.lastPage || 0,
        resultOnline?.pagination?.lastPage || 0,
      ),
      totalElements: uniqueAnimes.length,
    },
  };
};

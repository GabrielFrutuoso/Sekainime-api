import { listAnimesFromAnimesOnline } from "../../utils/listAnimes/listAnimesFromAnimesOnline";
import { AnimePromise } from "../../types/anime.type";
import { listAnimesFromAnimesFire } from "../../utils/listAnimes/listAnimesFromAnimesFire";

export const listAnimes = async (
  param: string = "top-animes",
  pageIndex: number | null = null,
  releaseYear: string | null = null,
): Promise<AnimePromise | null> => {
  const [resultFire, resultOnline] = await Promise.all([
    listAnimesFromAnimesFire(param, pageIndex, releaseYear),
    listAnimesFromAnimesOnline(pageIndex),
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

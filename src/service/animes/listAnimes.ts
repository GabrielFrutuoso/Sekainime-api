import { listAnimesFromAnimesOnline } from "../../utils/listAnimes/listAnimesFromAnimesOnline";
import { AnimePromise } from "../../types/anime.type";
import { listAnimesFromAnimesFire } from "../../utils/listAnimes/listAnimesFromAnimesFire";

const ANIMES_ONLINE_MAP: Record<string, string> = {
  "lista-de-animes-dublados": "?audio=Dublado",
  "lista-de-animes-legendados": "?audio=Legendado",
  "top-animes": "?ordem=score",
  "em-lancamento": "?ordem=date",
  "lista-de-filmes-legendados": "?ordem=date&tipo=Filme&audio=Legendado",
  "lista-de-filmes-dublados": "?ordem=date&tipo=Filme&audio=Dublado",
  "animes-atualizados": "?ordem=date",
};

export const listAnimes = async (
  param: string = "top-animes",
  pageIndex: number | null = null,
  releaseYear: string | null = null,
): Promise<AnimePromise | null> => {
  const onlineParam = ANIMES_ONLINE_MAP[param] || param;

  const [resultFire, resultOnline] = await Promise.all([
    listAnimesFromAnimesFire(param, pageIndex, releaseYear),
    listAnimesFromAnimesOnline(onlineParam, pageIndex),
  ]);

  if (!resultFire && !resultOnline) return null;

  const combinedAnimes = [
    ...(resultFire?.animes || []),
    ...(resultOnline?.animes || []),
  ];
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
      currentPage: pageIndex || 1,
      lastPage: Math.max(
        resultFire?.pagination?.lastPage || 0,
        resultOnline?.pagination?.lastPage || 0,
      ),
      totalElements: uniqueAnimes.length,
    },
  };
};

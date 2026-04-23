import { AnimeInfos } from "../../types/anime.type";
import { getAnimeInfosFromAnimesFire } from "../../utils/animeInfos/getAnimeInfosFromAnimesFire";
import { getAnimeInfosFromAnimesOnline } from "../../utils/animeInfos/getAnimeInfosFromAnimesOnline";

export const getAnimeInfos = async (
  anime: string,
): Promise<AnimeInfos | null> => {
  const [resultFire, resultOnline] = await Promise.all([
    getAnimeInfosFromAnimesFire(anime).catch(() => null),
    getAnimeInfosFromAnimesOnline(anime).catch(() => null),
  ]);

  if (!resultFire && !resultOnline) return null;

  if (!resultFire) return resultOnline;
  if (!resultOnline) return resultFire;

  if (resultFire.episodes.length >= resultOnline.episodes.length) {
    return resultFire;
  }

  return resultOnline;
};

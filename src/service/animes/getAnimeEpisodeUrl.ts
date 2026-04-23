import { getAnimeEpisodeUrlFromAnimesFire } from "../../utils/getAnimeEpisodeUrl/getAnimeEpisodeUrlFromAnimesFire";
import { getAnimeEpisodeUrlFromAnimesOnline } from "../../utils/getAnimeEpisodeUrl/getAnimeEpisodeUrlFromAnimesOnline";

export const getAnimeEpisodeUrl = async (anime: string, episode: string) => {
  const [animesFire, animesOnline] = await Promise.all([
    getAnimeEpisodeUrlFromAnimesFire(anime, episode).catch(() => null),
    getAnimeEpisodeUrlFromAnimesOnline(anime, episode).catch(() => null),
  ]);

  if (!animesFire && !animesOnline) return null;

  return {
    animesFire,
    animesOnline,
  };
};

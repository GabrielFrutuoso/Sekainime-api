import { ScrapeSource } from "../../types/scrapeSource.type";
import { scrapeEpisodeUrlFromSource } from "../../utils/scraper/scrapeEpisodeUrlFromSource";

export const getAnimeEpisodeUrl = async (
  sources: ScrapeSource[],
  anime: string,
  episode: string,
): Promise<{ videoUrls: string[] } | null> => {
  const results = await Promise.all(
    sources.map((source) =>
      scrapeEpisodeUrlFromSource(source, anime, episode).catch(() => null),
    ),
  );

  const videoUrls = results
    .filter((r): r is { videoUrl: string } => r?.videoUrl != null)
    .map((r) => r.videoUrl);

  if (videoUrls.length === 0) return null;

  return { videoUrls };
};

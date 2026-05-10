import { EpisodeConfig, ScrapeSource } from "../../types/scrapeSource.type";
import { withPage } from "../puppeteerPool";

export const scrapeEpisodeUrlFromSource = async (
  source: ScrapeSource,
  anime: string,
  episodeNumber: string,
): Promise<{ videoUrl: string | null } | null> => {
  const slug = anime.toLowerCase().replace(/ /g, "-");
  const path = source.episode.route
    .replace("{anime}", slug)
    .replace("{episode}", episodeNumber);
  const url = `${source.baseUrl}${path}`;

  try {
    const videoUrl = await withPage(async (browserPage) => {
      await browserPage.setRequestInterception(true);
      browserPage.on("request", (req) => {
        const type = req.resourceType();
        if (["image", "stylesheet", "font", "media"].includes(type)) {
          req.abort();
        } else {
          req.continue();
        }
      });

      await browserPage.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 15000,
      });

      return await browserPage.evaluate((config: EpisodeConfig) => {
        if (config.videoExtraction === "video") {
          const videoElement = document.querySelector<HTMLVideoElement>(
            config.selectors.videoSource,
          );
          if (!videoElement) return null;

          return (
            videoElement.src ||
            videoElement.currentSrc ||
            videoElement.getAttribute("src") ||
            videoElement.querySelector("source")?.getAttribute("src") ||
            null
          );
        }

        if (config.videoExtraction === "iframe") {
          const iframes = Array.from(
            document.querySelectorAll(config.selectors.videoSource),
          ).map((f) => (f as HTMLIFrameElement).src);

          const index = config.iframeIndex ?? 0;
          return iframes[index] || null;
        }

        return null;
      }, source.episode as any);
    });

    return { videoUrl };
  } catch (error) {
    console.error(`Failed to scrape episode from ${url}:`, error);
    return null;
  }
};

import { withPage } from "../puppeteerPool";

const BASE_URL = "https://animesonlines.net";

export const getAnimeEpisodeUrlFromAnimesOnline = async (
  anime: string,
  episodeNumber: string,
): Promise<{ videoUrl: string | null } | null> => {
  const animeName = anime.toLowerCase().replace(/ /g, "-");
  const pageUrl = `${BASE_URL}/episodio/${animeName}-episodio-${episodeNumber}/`;

  try {
    const iframes = await withPage(async (page) => {
      await page.goto(pageUrl, { waitUntil: "networkidle2", timeout: 30000 });
      return await page.evaluate(() =>
        Array.from(document.querySelectorAll("iframe")).map(
          (f) => (f as HTMLIFrameElement).src,
        ),
      );
    });

    return { videoUrl: iframes[1] };
  } catch (error) {
    console.error(`Error fetching EP ${episodeNumber}:`, error);
    return null;
  }
};

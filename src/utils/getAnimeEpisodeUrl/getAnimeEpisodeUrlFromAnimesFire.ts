import { withPage } from "../puppeteerPool";

export const getAnimeEpisodeUrlFromAnimesFire = async (
  anime: string,
  episodeNumber: string,
): Promise<{ videoUrl: string | null } | null> => {
  const animeName = anime.toLowerCase().replace(/ /g, "-");
  const url = `https://animefire.io/animes/${animeName}/${episodeNumber}`;

  try {
    const videoUrl = await withPage(async (page) => {
      await page.goto(url, { waitUntil: "networkidle2" });

      return await page.evaluate(() => {
        const videoElement = document.querySelector<HTMLVideoElement>(
          "#my-video_html5_api",
        );

        if (!videoElement) return null;

        return (
          videoElement.src ||
          videoElement.currentSrc ||
          videoElement.getAttribute("src") ||
          document
            .querySelector("#my-video_html5_api source")
            ?.getAttribute("src") ||
          null
        );
      });
    });

    return { videoUrl };
  } catch (error) {
    console.error(`Error fetching EP ${episodeNumber}:`, error);
    return null;
  }
};

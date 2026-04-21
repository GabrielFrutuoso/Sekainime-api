import puppeteer from "puppeteer";

export const getAnimeEpisodeUrl = async (
  anime: string,
  episodeNumber: string,
): Promise<{ videoUrl: string | null } | null> => {
  const animeSlug = anime.toLowerCase().replace(/ /g, "-");
  const url = `https://animefire.io/animes/${animeSlug}/${episodeNumber}`;
  const browser = await puppeteer.launch({ headless: true });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    );

    await page.goto(url, { waitUntil: "networkidle2" });

    let videoUrl = await page.evaluate(() => {
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

    if (!videoUrl) {
      const formattedEp = episodeNumber.padStart(2, "0");
      const fallbackUrl = `https://animesbr.lat/animes/${animeSlug}/episodios/${animeSlug}-episodio-${formattedEp}`;

      await page.goto(fallbackUrl, { waitUntil: "networkidle2" });

      videoUrl = await page.evaluate(() => {
        const videoElement = document.querySelector("video");

        if (!videoElement) return null;

        return (
          videoElement.src ||
          videoElement.currentSrc ||
          videoElement.getAttribute("src") ||
          document.querySelector("video source")?.getAttribute("src") ||
          null
        );
      });
    }

    await browser.close();
    return { videoUrl };
  } catch (error) {
    console.error(`Error fetching EP ${episodeNumber}:`, error);
    await browser.close();
    return null;
  }
};

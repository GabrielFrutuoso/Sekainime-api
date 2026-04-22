import puppeteer from "puppeteer";

const BASE_URL = "https://animesonlines.net";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36";

export const getAnimeEpisodeUrlFromAnimesOnline = async (
  anime: string,
  episodeNumber: string,
): Promise<{ videoUrl: string | null } | null> => {
  const animeName = anime.toLowerCase().replace(/ /g, "-");
  const pageUrl = `${BASE_URL}/episodio/${animeName}-episodio-${episodeNumber}/`;
  const browser = await puppeteer.launch({ headless: true });

  try {
    const mainPage = await browser.newPage();
    await mainPage.setUserAgent(UA);

    await mainPage.goto(pageUrl, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    const iframes = await mainPage.evaluate(() =>
      Array.from(document.querySelectorAll("iframe")).map((f) => f.src),
    );
    await mainPage.close();
    await browser.close();
    return { videoUrl: iframes[1] };
  } catch (error) {
    console.error(`Error fetching EP ${episodeNumber}:`, error);
    await browser.close();
    return null;
  }
};

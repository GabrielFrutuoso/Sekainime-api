import puppeteer from "puppeteer";

interface Episode {
  number: number;
  title: string;
}

export const getAnimeInfos = async (anime: string) => {
  const url = `https://animefire.io/animes/${anime.toLowerCase().replace(/ /g, "-")}-todos-os-episodios`;
  const browser = await puppeteer.launch({ headless: true });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    );

    await page.goto(url, { waitUntil: "domcontentloaded" });

    const animeData = await page.evaluate(() => {
      const items = document.querySelectorAll(".div_video_list a");

      if (items.length === 0) return null;

      const animeNameRaw = document.querySelector("h1")?.textContent || "";
      const animeBanner =
        document.querySelector("img")?.getAttribute("src") || "";

      const episodes: Episode[] = Array.from(items).map((el) => {
        const episodeNumber = (el as HTMLAnchorElement).href || "";
        const episodeTitle = el.textContent || "";

        return {
          number: Number(episodeNumber.split("/").filter(Boolean).pop()),
          title: episodeTitle,
        };
      });

      return {
        animeName: animeNameRaw.trim(),
        animeBanner,
        episodes,
      };
    });

    await browser.close();

    if (!animeData) {
      await browser.close();
      return [];
    }

    return animeData;
  } catch (error) {
    await browser.close();
    throw error;
  }
};

import puppeteer from "puppeteer";
import { Episode } from "../../types/episode.type";
import { AnimeInfos } from "../../types/anime.type";

export const getAnimeInfosFromAnimesOnline = async (
  anime: string,
): Promise<AnimeInfos | null> => {
  const url = `https://animesonlines.net/anime/${anime.toLowerCase().replace(/ /g, "-")}/`;
  const browser = await puppeteer.launch({ headless: true });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    );

    await page.goto(url, { waitUntil: "domcontentloaded" });

    const animeData = await page.evaluate(() => {
      const items = document.querySelectorAll(".episodes-grid a");

      if (items.length === 0) return null;

      const animeNameRaw =
        document.querySelector(".anime-hero-info h1")?.textContent || "";
      const poster =
        document
          .querySelector(".anime-hero-poster img")
          ?.getAttribute("data-src") ||
        document.querySelector(".anime-hero-poster img")?.getAttribute("src") ||
        "";
      const orientalName =
        document.querySelector(".title-sub")?.textContent || "";
      const japaneseName =
        document.querySelector(".title-sub")?.textContent || "";
      const synopsis =
        document.querySelector(".synopsis-text p")?.textContent || "";

      const episodes: Episode[] = Array.from(items).map((el, index) => {
        const episodeTitle = (el.textContent || "").replace(/[▶.]/g, "").trim();

        return {
          number: index + 1,
          title: animeNameRaw,
        };
      });

      return {
        name: animeNameRaw.trim(),
        japaneseName,
        orientalName,
        poster,
        synopsis,
        episodes,
      };
    });

    await browser.close();

    if (!animeData) {
      await browser.close();
      return null;
    }

    return animeData;
  } catch (error) {
    await browser.close();
    throw error;
  }
};

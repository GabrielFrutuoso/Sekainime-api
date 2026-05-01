import { Episode } from "../../types/episode.type";
import { AnimeInfos } from "../../types/anime.type";
import { withPage } from "../puppeteerPool";

export const getAnimeInfosFromAnimesOnline = async (
  anime: string,
): Promise<AnimeInfos | null> => {
  const url = `https://animesonlines.net/anime/${anime.toLowerCase().replace(/ /g, "-")}/`;

  try {
    const animeData = await withPage(async (page) => {
      await page.goto(url, { waitUntil: "domcontentloaded" });

      return await page.evaluate(() => {
        const items = document.querySelectorAll(".episodes-grid a");

        if (items.length === 0) return null;

        const animeNameRaw =
          document.querySelector(".anime-hero-info h1")?.textContent || "";
        const poster =
          document
            .querySelector(".anime-hero-poster img")
            ?.getAttribute("data-src") ||
          document
            .querySelector(".anime-hero-poster img")
            ?.getAttribute("src") ||
          "";
        const orientalName =
          document.querySelector(".title-sub")?.textContent || "";
        const japaneseName =
          document.querySelector(".title-sub")?.textContent || "";
        const synopsis =
          document.querySelector(".synopsis-text p")?.textContent || "";

        const episodes: Episode[] = Array.from(items).map((el, index) => {
          const episodeTitle = (el.textContent || "")
            .replace(/[▶.]/g, "")
            .trim();

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
    });

    if (!animeData) return null;
    return animeData;
  } catch (error) {
    throw error;
  }
};

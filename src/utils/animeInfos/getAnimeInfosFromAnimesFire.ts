import puppeteer from "puppeteer";
import { Episode } from "../../types/episode.type";
import { AnimeInfos } from "../../types/anime.type";

export const getAnimeInfosFromAnimesFire = async (
  anime: string,
): Promise<AnimeInfos | null> => {
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
      const poster =
        document
          .querySelector(".sub_animepage_img img")
          ?.getAttribute("data-src") ||
        document.querySelector(".sub_animepage_img img")?.getAttribute("src") ||
        "";
      const orientalName =
        document.querySelectorAll(".div_anime_names h6")[0]?.textContent || "";
      const japaneseName =
        document.querySelectorAll(".div_anime_names h6")[1]?.textContent || "";
      const synopsis = document.querySelector(".divSinopse")?.textContent || "";

      const episodes: Episode[] = Array.from(items).map((el) => {
        const episodeNumber = (el as HTMLAnchorElement).href || "";
        const episodeTitle = el.textContent || "";

        return {
          number: Number(episodeNumber.split("/").filter(Boolean).pop()),
          title: episodeTitle,
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

import { Episode } from "../../types/episode.type";
import { AnimeInfos } from "../../types/anime.type";
import { withPage } from "../puppeteerPool";

export const getAnimeInfosFromAnimesFire = async (
  anime: string,
): Promise<AnimeInfos | null> => {
  const url = `https://animefire.io/animes/${anime.toLowerCase().replace(/ /g, "-")}-todos-os-episodios`;

  try {
    const animeData = await withPage(async (page) => {
      await page.goto(url, { waitUntil: "domcontentloaded" });

      return await page.evaluate(() => {
        const items = document.querySelectorAll(".div_video_list a");

        if (items.length === 0) return null;

        const animeNameRaw = document.querySelector("h1")?.textContent || "";
        const poster =
          document
            .querySelector(".sub_animepage_img img")
            ?.getAttribute("data-src") ||
          document
            .querySelector(".sub_animepage_img img")
            ?.getAttribute("src") ||
          "";
        const orientalName =
          document.querySelectorAll(".div_anime_names h6")[0]?.textContent ||
          "";
        const japaneseName =
          document.querySelectorAll(".div_anime_names h6")[1]?.textContent ||
          "";
        const synopsis =
          document.querySelector(".divSinopse")?.textContent || "";

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
    });

    if (!animeData) return null;

    return animeData;
  } catch (error) {
    throw error;
  }
};

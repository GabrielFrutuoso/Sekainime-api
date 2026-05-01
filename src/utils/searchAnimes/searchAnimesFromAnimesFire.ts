import { Anime, AnimePromise } from "../../types/anime.type";
import { withPage } from "../puppeteerPool";

export const searchAnimesFromAnimesFire = async (
  param: string,
  pageIndex: number | null = 1,
): Promise<AnimePromise | null> => {
  const url = `https://animefire.io/pesquisar/${param
    .toLowerCase()
    .replace(/ /g, "-")}${pageIndex ? `/${pageIndex}` : "1"}`;

  try {
    const data = await withPage(async (page) => {
      await page.goto(url, { waitUntil: "domcontentloaded" });

      return await page.evaluate((pageIndex: number | null) => {
        const items = document.querySelectorAll(".divCardUltimosEps");

        const paginationLinks = document.querySelectorAll(
          ".pagination .page-item a",
        );
        const lastPageHref =
          paginationLinks.length > 0
            ? paginationLinks[paginationLinks.length - 1].getAttribute("href")
            : null;

        const lastPage = lastPageHref
          ? lastPageHref.split("/").filter(Boolean).pop()
          : null;

        const lastPageNum = Number(lastPage);
        const current = pageIndex || 1;

        const animes: Anime[] = Array.from(items).map((el) => {
          const name =
            el.querySelector(".animeTitle")?.textContent?.trim() || "";
          const poster =
            el.querySelector("img")?.getAttribute("data-src") ||
            el.querySelector("img")?.getAttribute("src") ||
            "";

          return {
            name,
            poster,
          };
        });

        if (animes.length === 0) {
          return null;
        }

        return {
          animes,
          pagination: {
            lastPage:
              lastPageNum && lastPageNum > current ? lastPageNum : current,
            currentPage: current,
            totalElements: animes.length,
          },
        };
      }, pageIndex);
    });

    return data;
  } catch (error) {
    throw error;
  }
};

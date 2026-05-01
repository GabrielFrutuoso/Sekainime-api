import { Anime, AnimePromise } from "../../types/anime.type";
import { withPage } from "../puppeteerPool";

export const listAnimesFromAnimesOnline = async (
  param: string = "score",
  pageIndex: number | null = 1,
): Promise<AnimePromise | null> => {
  const pageNumber = pageIndex || 1;
  const url = `https://animesonlines.net/lista-de-animes/${param}${
    pageNumber > 1 ? `pagina=${pageNumber}` : ""
  }`;

  try {
    const data = await withPage(async (page) => {
      await page.goto(url, { waitUntil: "domcontentloaded" });

      return await page.evaluate((current: number) => {
        const items = document.querySelectorAll(".sc-catalog-grid a");
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

        const animes: Anime[] = Array.from(items).map((el) => {
          const name =
            el.querySelector(".sc-card-title")?.textContent?.trim() || "";
          const poster =
            el.querySelector(".sc-card-poster img")?.getAttribute("data-src") ||
            el.querySelector(".sc-card-poster img")?.getAttribute("src") ||
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
      }, pageNumber);
    });

    return data;
  } catch (error) {
    throw error;
  }
};

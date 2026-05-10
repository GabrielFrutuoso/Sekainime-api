import { Anime, AnimePromise } from "../../types/anime.type";
import { ScrapeSource, ScrapeSelectors } from "../../types/scrapeSource.type";
import { withPage } from "../puppeteerPool";

export const scrapeSearchFromSource = async (
  source: ScrapeSource,
  query: string,
  page: number = 1,
): Promise<AnimePromise | null> => {
  const slug = query.toLowerCase().replace(/ /g, "-");
  const url = buildSearchUrl(source, slug, page);

  try {
    const data = await withPage(async (browserPage) => {
      await browserPage.goto(url, { waitUntil: "domcontentloaded" });

      return await browserPage.evaluate(
        (selectors: ScrapeSelectors, currentPage: number) => {
          const items = document.querySelectorAll(selectors.cardList);
          const paginationLinks = document.querySelectorAll(
            selectors.paginationLinks,
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
              el.querySelector(selectors.name)?.textContent?.trim() || "";
            const poster =
              el.querySelector(selectors.poster)?.getAttribute("data-src") ||
              el.querySelector(selectors.poster)?.getAttribute("src") ||
              "";

            return { name, poster };
          });

          if (animes.length === 0) return null;

          return {
            animes,
            pagination: {
              lastPage:
                lastPageNum && lastPageNum > currentPage
                  ? lastPageNum
                  : currentPage,
              currentPage,
              totalElements: animes.length,
            },
          };
        },
        source.search.selectors as any,
        page,
      );
    });

    return data;
  } catch (error) {
    console.error(`Failed to search ${url}:`, error);
    return null;
  }
};

function buildSearchUrl(
  source: ScrapeSource,
  query: string,
  page: number,
): string {
  let path = source.search.route.replace("{query}", query);

  if (source.search.pagination.type === "path") {
    const sep = source.search.pagination.separator ?? "/";
    path = `${path}${sep}${page}`;
  }

  const params = new URLSearchParams(source.search.queryParams || {});

  if (source.search.pagination.type === "query") {
    params.set("s", query);
    if (page > 1) {
      const paramName = source.search.pagination.paramName || "page";
      params.set(paramName, String(page));
    }
  }

  const qs = params.toString();
  return `${source.baseUrl}${path}${qs ? `?${qs}` : ""}`;
}

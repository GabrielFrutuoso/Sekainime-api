import { Anime, AnimePromise } from "../../types/anime.type";
import { ScrapeSource } from "../../types/scrapeSource.type";
import { withPage } from "../puppeteerPool";

export const scrapeAnimesFromSource = async (
  source: ScrapeSource,
  category: string,
  page: number = 1,
): Promise<AnimePromise | null> => {
  const routeConfig = source.routes[category];
  if (!routeConfig) return null;

  const url = buildUrl(source, routeConfig, page);

  try {
    const data = await withPage(async (browserPage) => {
      await browserPage.goto(url, { waitUntil: "domcontentloaded" });

      return await browserPage.evaluate(
        (selectors: ScrapeSource["home"]["selectors"], currentPage: number) => {
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
        source.home.selectors as any,
        page,
      );
    });

    return data;
  } catch (error) {
    console.error(`Failed to scrape ${url}:`, error);
    return null;
  }
};

function buildUrl(
  source: ScrapeSource,
  routeConfig: { route: string; queryParams?: Record<string, string> },
  page: number,
): string {
  let path = routeConfig.route;

  if (source.home.pagination.type === "path" && page > 1) {
    const sep = source.home.pagination.separator ?? "/";
    path = `${path}${sep}${page}`;
  }

  const params = new URLSearchParams(routeConfig.queryParams || {});

  if (source.home.pagination.type === "query" && page > 1) {
    const paramName = source.home.pagination.paramName || "page";
    params.set(paramName, String(page));
  }

  const qs = params.toString();
  return `${source.baseUrl}${path}${qs ? `?${qs}` : ""}`;
}

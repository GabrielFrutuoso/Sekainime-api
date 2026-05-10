import { AnimeInfos } from "../../types/anime.type";
import { Episode } from "../../types/episode.type";
import { InfosSelectors, ScrapeSource } from "../../types/scrapeSource.type";
import { withPage } from "../puppeteerPool";

export const scrapeAnimeInfosFromSource = async (
  source: ScrapeSource,
  anime: string,
): Promise<AnimeInfos | null> => {
  const slug = anime.toLowerCase().replace(/ /g, "-");
  const path = source.infos.route.replace("{anime}", slug);
  const url = `${source.baseUrl}${path}`;

  try {
    const animeData = await withPage(async (browserPage) => {
      await browserPage.goto(url, { waitUntil: "domcontentloaded" });

      return await browserPage.evaluate((selectors: InfosSelectors) => {
        const items = document.querySelectorAll(selectors.episodes);

        if (items.length === 0) return null;

        const name =
          document.querySelector(selectors.name)?.textContent?.trim() || "";
        const poster =
          document.querySelector(selectors.poster)?.getAttribute("data-src") ||
          document.querySelector(selectors.poster)?.getAttribute("src") ||
          "";
        const orientalName =
          document.querySelector(selectors.orientalName)?.textContent?.trim() ||
          "";
        const japaneseName =
          document.querySelector(selectors.japaneseName)?.textContent?.trim() ||
          "";
        const synopsis =
          document.querySelector(selectors.synopsis)?.textContent?.trim() || "";

        const episodes: Episode[] = Array.from(items).map((el, index) => {
          const episodeTitle = (el.textContent || "")
            .replace(/[▶.]/g, "")
            .trim();
          const href = (el as HTMLAnchorElement).href || "";
          const numberFromHref = Number(href.split("/").filter(Boolean).pop());

          return {
            number: isNaN(numberFromHref) ? index + 1 : numberFromHref,
            title: episodeTitle || name,
          };
        });

        return {
          name,
          japaneseName,
          orientalName,
          poster,
          synopsis,
          episodes,
        };
      }, source.infos.selectors as any);
    });

    return animeData;
  } catch (error) {
    console.error(`Failed to scrape infos from ${url}:`, error);
    return null;
  }
};

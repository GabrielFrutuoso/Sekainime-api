import puppeteer from "puppeteer";
import { Anime } from "../../types/anime.type";

export const searchAnimes = async (
  param: string,
): Promise<{ animes: Anime[] } | null> => {
  const url = `https://animefire.io/pesquisar/${param.toLowerCase().replace(/ /g, "-")}`;
  const browser = await puppeteer.launch({ headless: true });

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded" });

  try {
    const data = await page.evaluate(() => {
      const items = document.querySelectorAll(".divCardUltimosEps");

      const animes: Anime[] = Array.from(items).map((el) => {
        const name = el.querySelector(".animeTitle")?.textContent?.trim() || "";
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
      };
    });

    await browser.close();
    return data;
  } catch (error) {
    await browser.close();
    throw error;
  }
};

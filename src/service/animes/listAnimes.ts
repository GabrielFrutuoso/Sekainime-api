import puppeteer from "puppeteer";

export const listAnimes = async (
  param: string = "top-animes",
  pageIndex: number | null = null,
  releaseYear: string | null = null,
) => {
  const url = `https://animefire.io/${param}${pageIndex ? `/${pageIndex}` : ""}${
    releaseYear ? `?ano=${releaseYear}` : ""
  }`;
  const browser = await puppeteer.launch({ headless: true });

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded" });

  try {
    const data = await page.evaluate(() => {
      const items = document.querySelectorAll(".divCardUltimosEps");
      const lastPageHref = document
        .querySelector(".firLasLi a")
        ?.getAttribute("href");
      const lastPage = lastPageHref
        ? lastPageHref.split("/").filter(Boolean).pop()
        : null;

      const animes: { name: string; poster: string }[] = Array.from(items).map(
        (el) => {
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
        },
      );

      if (animes.length === 0) {
        return null;
      }

      return { animes, lastPage };
    });

    await browser.close();
    return data;
  } catch (error) {
    await browser.close();
    throw error;
  }
};

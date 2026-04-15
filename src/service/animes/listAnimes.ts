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

  const data = await page.evaluate(() => {
    const items = document.querySelectorAll(
      ".card-group .row .divCardUltimosEps .cardUltimosEps",
    );

    const animes = Array.from(items).map((el) => {
      const animeName =
        el.querySelector("h3")?.textContent || "";
      return { animeName };
    });

    return animes;
  });

  await browser.close();
  return data;
};

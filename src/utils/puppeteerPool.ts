import puppeteer, { Browser, Page } from "puppeteer";

const MAX_PAGES = Number(process.env.PUPPETEER_MAX_PAGES || 5);
const LAUNCH_OPTIONS = {
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
};

let browser: Browser | null = null;

class Semaphore {
  private tokens: number;
  private waiters: Array<() => void> = [];

  constructor(tokens: number) {
    this.tokens = tokens;
  }

  async acquire() {
    if (this.tokens > 0) {
      this.tokens -= 1;
      return;
    }

    await new Promise<void>((resolve) => this.waiters.push(resolve));
  }

  release() {
    this.tokens += 1;
    const next = this.waiters.shift();
    if (next) {
      this.tokens -= 1;
      next();
    }
  }
}

const semaphore = new Semaphore(MAX_PAGES);

export async function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await puppeteer.launch(LAUNCH_OPTIONS as any);
    const cleanClose = async () => {
      try {
        await browser?.close();
      } catch {}
    };
    process.on("exit", cleanClose);
    process.on("SIGINT", () => {
      cleanClose().then(() => process.exit(0));
    });
  }
  return browser;
}

export async function withPage<T>(fn: (page: Page) => Promise<T>): Promise<T> {
  await semaphore.acquire();
  const b = await getBrowser();
  const page = await b.newPage();
  try {
    await page.setUserAgent(
      process.env.PUPPETEER_UA ||
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    );
    await page.setViewport({ width: 1280, height: 800 });
    const res = await fn(page);
    return res;
  } finally {
    try {
      await page.close();
    } catch {}
    semaphore.release();
  }
}

export async function closeBrowser() {
  if (browser) {
    try {
      await browser.close();
    } catch {}
    browser = null;
  }
}

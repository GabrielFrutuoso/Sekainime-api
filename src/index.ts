import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { animesController } from "./controller/animes";
import { closeBrowser } from "./utils/puppeteerPool";

const app = new Elysia().use(cors()).use(animesController).listen(8888);

const shutdown = async (signal: string) => {
  console.log(`${signal} received. Closing browser pool...`);
  await closeBrowser();
  process.exit(0);
};

process.once("SIGINT", () => {
  shutdown("SIGINT").catch(() => process.exit(1));
});

process.once("SIGTERM", () => {
  shutdown("SIGTERM").catch(() => process.exit(1));
});

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

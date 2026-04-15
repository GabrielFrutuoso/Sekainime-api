import { Elysia } from "elysia";
import { animesController } from "./controller/animes";

const app = new Elysia()
  .use(animesController)
  .listen(8888);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { animesController } from "./controller/animes";

const app = new Elysia()
  .use(cors())
  .use(animesController)
  .listen(8888);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

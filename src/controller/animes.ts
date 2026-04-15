import { Elysia } from "elysia";
import { listAnimes } from "../service/animes/listAnimes";

export const animesController = new Elysia().group("/animes", (app) =>
  app.get("/:category?", async ({ params }) => {
    const animes = await listAnimes(params.category);
    return animes;
  }),
);

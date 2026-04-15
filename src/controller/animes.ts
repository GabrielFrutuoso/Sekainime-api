import { Elysia } from "elysia";
import { listAnimes } from "../service/animes/listAnimes";

export const animesController = new Elysia().group("/animes", (app) =>
  app.get("/:category?/:page?", async ({ params, query, set }) => {
    const animes = await listAnimes(
      params.category,
      params.page ? Number(params.page) : null,
      query.ano,
    );
    if (!animes) set.status = 404;
    return animes;
  }),
);

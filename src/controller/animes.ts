import { Elysia } from "elysia";
import { listAnimes } from "../service/animes/listAnimes";
import { searchAnimes } from "../service/animes/searchAnimes";
import { getAnimeInfos } from "../service/animes/getAnimeInfos";
import { getAnimeEpisodeUrl } from "../service/animes/getAnimeEpisodeUrl";

export const animesController = new Elysia().group("/animes", (app) =>
  app
    .get("/search/:param", async ({ params, set }) => {
      const animes = await searchAnimes(params.param);
      if (!animes) set.status = 404;
      return animes;
    })
    .get("/watch/:anime/:episode", async ({ params, set }) => {
      const url = await getAnimeEpisodeUrl(params.anime, params.episode);
      if (!url) set.status = 404;
      return url;
    })
    .get("/:category?/:page?", async ({ params, query, set }) => {
      const animes = await listAnimes(
        params.category,
        params.page ? Number(params.page) : null,
        query.ano,
      );
      if (!animes) set.status = 404;
      return animes;
    })
    .get("/infos/:anime", async ({ params, set }) => {
      const anime = await getAnimeInfos(params.anime);
      if (!anime) set.status = 404;
      return anime;
    }),
);

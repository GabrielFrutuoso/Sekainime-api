import { Elysia } from "elysia";
import { listAnimes } from "../service/animes/listAnimes";
import { getAnimeEpisodeUrl } from "../service/animes/getAnimeEpisodeUrl";
import { searchAnimes } from "../service/animes/searchAnimes";
import { getAnimeInfos } from "../service/animes/getAnimeInfos";

export const animesController = new Elysia().group("/animes", (app) =>
  app
    .get("/search/:param/:page?", async ({ params, set }) => {
      const animes = await searchAnimes(
        params.param,
        params.page ? Number(params.page) : null,
      );
      if (!animes) set.status = 404;
      return animes;
    })
    .get("/watch/:anime/:episode", async ({ params, set }) => {
      const result = await getAnimeEpisodeUrl(params.anime, params.episode);
      if (!result) set.status = 404;
      return result;
    })
    .get("/:category?/:page?", async ({ params, set }) => {
      const page = params.page ? Number(params.page) : null;
      const category = params.category || null;

      const result = await listAnimes(category || "top-animes", page);
      if (!result) set.status = 404;
      return result;
    })
    .get("/infos/:anime", async ({ params, set }) => {
      const anime = await getAnimeInfos(params.anime);
      if (!anime) set.status = 404;
      return anime;
    }),
);

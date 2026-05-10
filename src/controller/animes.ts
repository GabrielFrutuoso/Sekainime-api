import { Elysia } from "elysia";
import { listAnimes } from "../service/animes/listAnimes";
import { getAnimeEpisodeUrl } from "../service/animes/getAnimeEpisodeUrl";
import { searchAnimes } from "../service/animes/searchAnimes";
import { getAnimeInfos } from "../service/animes/getAnimeInfos";
import { ScrapeSource } from "../types/scrapeSource.type";

export const animesController = new Elysia().group("/animes", (app) =>
  app
    .post("/search/:param/:page?", async ({ params, body, set }) => {
      const { sources } = body as {
        sources: ScrapeSource[];
      };

      if (!sources || !Array.isArray(sources) || sources.length === 0) {
        set.status = 400;
        return { error: "sources array is required" };
      }

      const animes = await searchAnimes(
        sources,
        params.param,
        params.page ? Number(params.page) : null,
      );
      if (!animes) set.status = 404;
      return animes;
    })
    .post("/watch/:anime/:episode", async ({ params, body, set }) => {
      const { sources } = body as {
        sources: ScrapeSource[];
      };

      if (!sources || !Array.isArray(sources) || sources.length === 0) {
        set.status = 400;
        return { error: "sources array is required" };
      }

      const result = await getAnimeEpisodeUrl(
        sources,
        params.anime,
        params.episode,
      );

      const animeName = params.anime;
      const episodeName = params.episode;
      if (!result) set.status = 404;
      return { animeName, episodeName, ...result };
    })
    .post("/list/:category/:page?", async ({ params, body, set }) => {
      const { sources } = body as {
        sources: ScrapeSource[];
        page?: number;
      };
      const { category, page: paramPage } = params;

      if (!sources || !Array.isArray(sources) || sources.length === 0) {
        set.status = 400;
        return { error: "sources array is required" };
      }

      if (!category) {
        set.status = 400;
        return { error: "category is required" };
      }

      const result = await listAnimes(
        sources,
        category,
        paramPage ? Number(paramPage) : 1,
      );
      if (!result) set.status = 404;
      return result;
    })
    .post("/infos/:anime", async ({ params, body, set }) => {
      const { sources } = body as {
        sources: ScrapeSource[];
      };

      if (!sources || !Array.isArray(sources) || sources.length === 0) {
        set.status = 400;
        return { error: "sources array is required" };
      }

      const anime = await getAnimeInfos(sources, params.anime);
      if (!anime) set.status = 404;
      return anime;
    }),
);

import { Episode } from "./episode.type";
import { Pagination } from "./pagination.type";

export type Anime = {
  name: string;
  poster: string;
};

export type AnimeInfos = {
  name: string;
  japaneseName: string;
  orientalName: string;
  poster: string;
  synopsis: string;
  episodes: Episode[];
};

export type AnimePromise = {
  animes: Anime[];
  pagination: Pagination;
};
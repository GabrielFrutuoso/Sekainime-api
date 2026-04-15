import { Pagination } from "./pagination.type";

export type Anime = {
  name: string;
  poster: string;
};

export type AnimePromise = {
  animes: Anime[];
  pagination: Pagination;

};
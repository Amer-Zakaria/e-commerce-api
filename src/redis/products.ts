import { cacheClient } from "..";
import IPagination from "../Interfaces/IPagination";
import IProductSchema from "../Interfaces/IProductSchema";
import { IFilterProduct } from "../models/product";
import { INDEX } from "../utils/syncCache";
import IReturnedList from "../Interfaces/IReturnedList";

export function getCachedProducts(
  { name, price, categories, tags }: IFilterProduct,
  pagination: IPagination
): Promise<IReturnedList<IProductSchema>> {
  const pageNumber = +(pagination.pageNumber ?? 1);
  const pageSize = +(pagination.pageSize ?? 10);

  const byName = name && `@name:\*${name.trim()}\*`,
    byPrice = price && `@price:[${price[0]} ${price[1]}]`,
    byCategories =
      categories &&
      categories?.length >= 1 &&
      `@category:(${categories.join(" | ")})`,
    byTags = tags && tags?.length >= 1 && `@tags:(${tags.join(" | ")})`;
  const filters = [byName, byPrice, byCategories, byTags]
    .filter((filter) => filter)
    .join(" ");

  return cacheClient.ft
    .search(INDEX, filters || "*", {
      LIMIT: {
        from: (pageNumber - 1) * pageSize,
        size: pageSize,
      },
    })
    .then((result) => ({
      products: result.documents.map(
        (doc) => doc.value
      ) as unknown as IProductSchema[],
      paginationInfo: {
        totalItems: result.total,
        totalPages: Math.ceil(result.total / pageSize),
        pageSize,
        pageNumber,
      },
      source: "cache",
    }));
}

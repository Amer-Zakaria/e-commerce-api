import IPagination from "./IPagination";

export default interface IReturnedList<listElement> {
  products: listElement[];
  paginationInfo: IPagination & { totalPages: number; totalItems: number };
}

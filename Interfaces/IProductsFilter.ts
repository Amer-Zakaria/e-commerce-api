import IProductSchema from "./IProductSchema";

export interface IProductsFilterRequest {
  name?: IProductSchema["name"];
  price?: [number, number];
  tags?: IProductSchema["tags"];
  categories?: IProductSchema["category"][];
}

export interface IProductsFilterForMongoose {
  name?: RegExp;
  price?: { $gte: number; $lte: number };
  tags?: { $in: IProductSchema["tags"] };
  category?: IProductSchema["category"][];
}

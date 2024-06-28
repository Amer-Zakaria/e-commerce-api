import IProductSchema from "./IProductSchema";

export default interface IProductsFilterForMongoose {
  name?: RegExp;
  price?: { $gte: number; $lte: number };
  tags?: { $in: IProductSchema["tags"] };
  category?: IProductSchema["category"][];
}

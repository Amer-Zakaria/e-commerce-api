import IProductSchema from "./IProductSchema";

export default interface ICreateProduct {
  name: IProductSchema["name"];
  tags: IProductSchema["tags"];
  quantity: IProductSchema["quantity"];
  category?: IProductSchema["category"];
  price?: IProductSchema["price"];
  vendor?: IProductSchema["vendor"];
}

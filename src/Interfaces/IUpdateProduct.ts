import IProductSchema from "./IProductSchema";

export default interface IUpdateProduct {
  name: IProductSchema["name"];
  tags: IProductSchema["tags"];
  quantity: IProductSchema["quantity"];
  category?: IProductSchema["category"];
  price?: IProductSchema["price"];
  isActive?: IProductSchema["isActive"];
  vendor?: IProductSchema["vendor"];
}

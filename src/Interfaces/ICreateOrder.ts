export default interface ICreateOrder {
  products: IProduct[];
}

interface IProduct {
  id: string;
  orderedQuantity: number;
}

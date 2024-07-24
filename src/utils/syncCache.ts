import { Product } from "../models/product";
import { cacheClient } from "..";
import { SchemaFieldTypes } from "redis";

const INDEX = "product:id";

export default async function syncCache() {
  //checking for the products
  const CUSOR = 0,
    MATCH = "product:*",
    COUNT = 1;
  const scanResult = await cacheClient.scan(CUSOR, { MATCH, COUNT });
  const doProductsAlreadyExist: boolean = scanResult.keys.length > 0;

  //Add the products again if there don't already exist
  if (!doProductsAlreadyExist) {
    // remove any indices & any data
    await cacheClient.flushAll();

    // repopulate the products
    const products = await Product.find();
    const multi = cacheClient.multi();
    products.forEach((product) => {
      multi.json.set("product:" + product.id, "$", product as any);
    });
    await multi.exec();

    // Create the Index again
    await cacheClient.ft.create(
      INDEX,
      // Apply ndex just on the filter fields
      {
        "$.name": {
          type: SchemaFieldTypes.TEXT,
          AS: "name",
        },
        "$.price": {
          type: SchemaFieldTypes.NUMERIC,
          AS: "price",
        },
        "$.tags[*]": {
          type: SchemaFieldTypes.TEXT,
          AS: "tags",
        },
        "$.category": {
          type: SchemaFieldTypes.TEXT,
          AS: "category",
        },
      },
      {
        ON: "JSON",
        PREFIX: "product",
      }
    );
  }
}

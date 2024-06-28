import IPagination from "../Interfaces/IPagination";
import { z } from "zod";

/**
 * @openapi
 * components:
 *   schemas:
 *     pageNumber:
 *       type: number
 *       minimum: 1
 *       maximum: 99999999
 *     pageSize:
 *       type: number
 *       minimum: 1
 *       maximum: 100
 */
const paginationSchema = z
  .object({
    pageNumber: z
      .string()
      .transform((val) => parseInt(val, 10))
      .refine((val) => !isNaN(val) && val >= 1 && val <= 99999999, {
        message: "Invalid page number",
      }),
    pageSize: z
      .string()
      .transform((val) => parseInt(val, 10))
      .refine((val) => !isNaN(val) && val >= 1 && val <= 100, {
        message: "Invalid page size",
      }),
  })
  .partial();

export default paginationSchema;

export type ICreateOrder = z.infer<typeof paginationSchema>;

import IPagination from "../Interfaces/IPagination";
import Joi from "joi";

export default function paginationValidation(pagination: IPagination) {
  const schema = Joi.object({
    pageNumber: Joi.number().min(1).max(99999999),
    pageSize: Joi.number().min(1).max(100),
  });

  return schema.validate(pagination, { abortEarly: false });
}

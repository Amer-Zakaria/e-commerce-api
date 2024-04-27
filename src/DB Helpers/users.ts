import User from "../models/user";
import { Error } from "mongoose";
import ICreateUser from "../Interfaces/ICreateUser";
import IPagination from "../Interfaces/IPagination";
import bcrypt from "bcrypt";
import ConstructDBHelperExpectedError from "../utils/ConstructDBHelperExpectedError";

//READ
export async function getUsers(pagination: IPagination) {
  const pageNumber = +(pagination.pageNumber ?? 1);
  const pageSize = +(pagination.pageSize ?? 10);

  const UsersPromise = User.find()
    .sort({
      date: -1,
    })
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize);

  const UsersCountPromise = User.count();

  return Promise.all([UsersPromise, UsersCountPromise]).then((result) => ({
    users: result[0],
    paginationInfo: {
      totalItems: result[1],
      totalPages: Math.ceil(result[1] / pageSize),
      pageSize: pageSize,
      pageNumber: pageNumber,
    },
  }));
}

//CREATE
export async function createUser(createdUser: ICreateUser) {
  //hashing the password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(createdUser.password, salt);
  createdUser.password = hashedPassword;

  //creating the user
  const user = new User(createdUser);

  return user
    .save()
    .then(({ generateAuthToken, ...others }) => {
      //excluding the password
      const { password, ...user } = (others as any)._doc;
      return {
        ...user,
        generateAuthToken: generateAuthToken,
      };
    })
    .catch((errs: Error.ValidationError) => {
      if (errs.errors) return ConstructDBHelperExpectedError(400, errs);
      throw new Error(errs.message);
    });
}

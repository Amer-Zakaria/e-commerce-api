import IUserSchema from "./IUserSchema";

export default interface ICreateUser{
    name: IUserSchema["name"];
    email: IUserSchema["email"];
    password: IUserSchema["password"];
}
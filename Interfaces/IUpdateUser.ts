import IUserSchema from "./IUserSchema";

export default interface IUpdateUser{
    name: IUserSchema["name"];
    email: IUserSchema["email"];
}
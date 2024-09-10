export interface ICreateUserDto {
    firstName: string;
    lastName: string;
    age: string;
    email: string;
    password: string;
    refreshToken?: string;
}


export interface IUpdateUserDto{
    firstName?: string;
    lastName?: string;
    age?: string;
    refreshToken?: string;
}

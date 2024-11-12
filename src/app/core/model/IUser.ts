export interface User {
    userId?: string;
    _id?: string;
    name: string;
    email?: string;
    mobile: string;
    status?: boolean;
    password?: string
    imageUrl?: string;
    createdAt?:Date;
    selected?:boolean
  }

   export interface userResponse {
    response: User;
    data: User[];
  }
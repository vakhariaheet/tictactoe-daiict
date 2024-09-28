export interface UserCreatedHookParams {
    data: {
        id: string;
        username: string;
    }
}



export interface AddUserInfoParams {
    is_student: true;
    bio: string;
    university?: string;
    specialization?: string;
    year?: number;
    semester?: number;
    course?: string;
}
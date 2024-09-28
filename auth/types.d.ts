export interface UserCreatedHookParams {
    data: {
        id: string;
        username: string;
    }
}



export interface AddUserInfoParams {
    is_student: boolean;
    bio: string;
    university?: string;
    specialization?: string;
    year?: string;
    semester?: string;
    course?: string;
}
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

export interface DBUser { 
    id: string;
	username: string;
	is_student: boolean;
	bio: string;
	university: string;
	specialization: string;
	yr: number;
	sem: number;
	course: string;
	is_verified: boolean;
	has_completed_profile: boolean;
}
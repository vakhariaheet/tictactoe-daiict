export interface DBPost {
    content: string;
    avg_rating: number;
    id: string;
    author_id: string;
    created_at: string;
    updated_at: string;
}

export interface DBPostAttachment { 
    postid: string;
    url: string;
    mimeType: string;
}

export interface DBRating {
    postid: string;
    rating: number;
    content: string;
    created_at: string;
    updated_at: string;
    user_id: string;
}



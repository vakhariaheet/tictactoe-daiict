CREATE TABLE users(
    id VARCHAR(255) PRIMARY KEY,
    is_student BOOLEAN,
    bio TEXT,
    sem INT,
    yr INT,
    course VARCHAR(255),
    specialization VARCHAR(100),
    university VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    has_completed_profile BOOLEAN DEFAULT FALSE
);

CREATE TABLE user_lists(
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id),
    list_name VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_posts INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT user_list_unique UNIQUE (user_id, list_name)
);

CREATE TABLE user_saved_posts(
   
    user_id VARCHAR(255) REFERENCES users(id),
    post_id VARCHAR(255),
    list_id VARCHAR(255) REFERENCES user_lists(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (list_id) REFERENCES user_lists(id) ON DELETE CASCADE
    
);


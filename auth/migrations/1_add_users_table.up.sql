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



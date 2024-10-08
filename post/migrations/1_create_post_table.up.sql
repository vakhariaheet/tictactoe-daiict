CREATE TABLE posts(
    id VARCHAR(255) PRIMARY KEY,
    author_id VARCHAR(255),
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    avg_rating FLOAT DEFAULT 0
);

CREATE TABLE post_attachments(
    id VARCHAR(255) PRIMARY KEY,
    post_id VARCHAR(255) REFERENCES posts(id),
    url TEXT,
    type VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE TABLE post_ratings(
    id VARCHAR(255) PRIMARY KEY,
    post_id VARCHAR(255) REFERENCES posts(id),
    user_id VARCHAR(255),
    rating INT,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);


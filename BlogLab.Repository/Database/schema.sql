-- BlogLab schema for PostgreSQL (Neon).
-- Safe to run many times: the API runs it at startup and it only creates what is missing.

CREATE TABLE IF NOT EXISTS application_user (
    application_user_id  INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username             VARCHAR(20)  NOT NULL,
    normalized_username  VARCHAR(20)  NOT NULL,
    email                VARCHAR(30)  NOT NULL,
    normalized_email     VARCHAR(30)  NOT NULL,
    fullname             VARCHAR(30),
    password_hash        TEXT         NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_application_user_normalized_username ON application_user (normalized_username);
CREATE INDEX IF NOT EXISTS ix_application_user_normalized_email ON application_user (normalized_email);

CREATE TABLE IF NOT EXISTS photo (
    photo_id             INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    application_user_id  INT          NOT NULL REFERENCES application_user (application_user_id),
    public_id            VARCHAR(50)  NOT NULL,
    image_url            VARCHAR(250) NOT NULL,
    description          VARCHAR(30)  NOT NULL,
    publish_date         TIMESTAMPTZ  NOT NULL DEFAULT now(),
    update_date          TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_photo_application_user_id ON photo (application_user_id);

CREATE TABLE IF NOT EXISTS blog (
    blog_id              INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    application_user_id  INT          NOT NULL REFERENCES application_user (application_user_id),
    photo_id             INT          REFERENCES photo (photo_id),
    title                VARCHAR(50)  NOT NULL,
    content              TEXT         NOT NULL,
    publish_date         TIMESTAMPTZ  NOT NULL DEFAULT now(),
    update_date          TIMESTAMPTZ  NOT NULL DEFAULT now(),
    active_ind           BOOLEAN      NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS ix_blog_application_user_id ON blog (application_user_id);

CREATE TABLE IF NOT EXISTS blog_comment (
    blog_comment_id         INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    parent_blog_comment_id  INT          REFERENCES blog_comment (blog_comment_id),
    blog_id                 INT          NOT NULL REFERENCES blog (blog_id),
    application_user_id     INT          NOT NULL REFERENCES application_user (application_user_id),
    content                 VARCHAR(300) NOT NULL,
    publish_date            TIMESTAMPTZ  NOT NULL DEFAULT now(),
    update_date             TIMESTAMPTZ  NOT NULL DEFAULT now(),
    active_ind              BOOLEAN      NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS ix_blog_comment_blog_id ON blog_comment (blog_id);

-- Blog / comment rows together with the author's username
CREATE OR REPLACE VIEW blog_view AS
SELECT b.blog_id, b.application_user_id, u.username, b.title, b.content, b.photo_id,
       b.publish_date, b.update_date, b.active_ind
FROM blog b
JOIN application_user u ON u.application_user_id = b.application_user_id;

CREATE OR REPLACE VIEW blog_comment_view AS
SELECT c.blog_comment_id, c.parent_blog_comment_id, c.blog_id, c.content, u.username,
       c.application_user_id, c.publish_date, c.update_date, c.active_ind
FROM blog_comment c
JOIN application_user u ON u.application_user_id = c.application_user_id;

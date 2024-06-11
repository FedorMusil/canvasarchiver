from get_db_conn import get_db_conn

conn = get_db_conn()
cur = conn.cursor()

cur.execute('''
CREATE TYPE change_type AS ENUM ('Deletion', 'Addition', 'Modification');
CREATE TYPE item_types AS ENUM ('Assignments', 'Pages', 'Files', 'Quizzes', 'Modules', 'Sections');
CREATE TYPE user_role AS ENUM ('TA', 'Teacher');

CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role user_role NOT NULL
);

CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    course_code TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS changes (
    id SERIAL PRIMARY KEY,
    change_type_id change_type NOT NULL,
    item_type item_types NOT NULL,
    old_value JSON,
    new_value JSON
);

CREATE TABLE IF NOT EXISTS annotations (
    id SERIAL PRIMARY KEY,
    change_id INT REFERENCES changes(id),
    user_id INT REFERENCES users(id),
    text TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL
);
''')

conn.commit()
cur.close()
conn.close()

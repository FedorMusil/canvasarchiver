from get_db_conn import get_db_conn


# Warning Do not run this script unless you want to destroy the existing tables and recreate them.
# This script is used to create the tables in the database. It will first
# drop the existing tables if destroy_existing_tables is True.


def create_tables(destroy_existing_tables=False):
    '''Creates the tables in the database. If destroy_existing_tables is True, it will first drop the existing tables.
       Warning: This will delete all data in the tables. Use with caution.'''
    conn = get_db_conn()
    cur = conn.cursor()

    if destroy_existing_tables:

        print('Destroying existing tables...')
        cur.execute('''


        DROP TABLE IF EXISTS annotations;
        DROP TABLE IF EXISTS changes;
        DROP TABLE IF EXISTS teacher_courses;
        DROP TABLE IF EXISTS users;
        DROP TABLE IF EXISTS courses;

        DROP TYPE IF EXISTS change_type;
        DROP TYPE IF EXISTS item_types;
        DROP TYPE IF EXISTS user_role;

        ''')
        conn.commit()

    print('Creating tables...')
    cur.execute('''
    CREATE TYPE change_type AS ENUM ('Deletion', 'Addition', 'Modification');
    CREATE TYPE item_types AS ENUM ('Assignments', 'Pages', 'Files', 'Quizzes', 'Modules', 'Sections');
    CREATE TYPE user_role AS ENUM ('TA', 'Teacher');

    CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        course_code TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS teacher_courses (
        user_id INT REFERENCES users(id),
        course_id INT REFERENCES courses(id),
        role user_role NOT NULL,
        PRIMARY KEY (user_id, course_id)
    );

    CREATE TABLE IF NOT EXISTS changes (
        id SERIAL PRIMARY KEY,
        item_id INT NOT NULL,
        course_id INT REFERENCES courses(id),
        change_type change_type NOT NULL,
        timestamp TIMESTAMP NOT NULL,
        item_type item_types NOT NULL,
        older_diff INT REFERENCES changes(id),
        diff JSON
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


if __name__ == '__main__':
    create_tables(destroy_existing_tables=False)
    print('Tables created successfully.')

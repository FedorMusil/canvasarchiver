from get_db_conn import get_db_conn

# Warning Do not run this script unless you want to destroy the existing tables and recreate them.
# This script is used to create the tables in the database. It will first
# drop the existing tables if destroy_existing_tables is True.


async def create_tables(destroy_existing_tables=False):
    '''Creates the tables in the database. If destroy_existing_tables is True, it will first drop the existing tables.
       Warning: This will delete all data in the tables. Use with caution.'''
    conn = await get_db_conn()
    await conn.execute('''
        DROP TABLE IF EXISTS teacher_courses CASCADE;
        DROP TABLE IF EXISTS users CASCADE;
        DROP TABLE IF EXISTS courses CASCADE;
        DROP TABLE IF EXISTS changes CASCADE;
        DROP TABLE IF EXISTS annotations CASCADE;


        DROP TYPE IF EXISTS user_role CASCADE;
        DROP TYPE IF EXISTS item_types CASCADE;
        DROP TYPE IF EXISTS change_type CASCADE;
    ''')

    await conn.execute('''
        CREATE TYPE change_type AS ENUM ('Deletion', 'Addition', 'Modification');
        CREATE TYPE item_types AS ENUM ('Courses', 'Assignments', 'Pages', 'Files', 'Quizzes', 'Modules', 'Sections');
        CREATE TYPE user_role AS ENUM ('TA', 'Teacher');

 CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        course_ids integer[] NOT NULL,
        name TEXT NOT NULL,
        course_code TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS teacher_courses (
        user_id TEXT REFERENCES users(id),
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
        older_diff INT REFERENCES changes(id) NULL,
        diff TEXT NOT NULL,
        highlights TEXT         
    );

    CREATE TABLE IF NOT EXISTS annotations (
        id SERIAL PRIMARY KEY,
        change_id INT REFERENCES changes(id),
        user_id TEXT REFERENCES users(id),
        text TEXT NOT NULL,
        timestamp TIMESTAMP NOT NULL,
        parentID INT REFERENCES annotations(id) NULL,
        selectionId TEXT
    );
    ''')

    await conn.close()

if __name__ == '__main__':
    import asyncio
    asyncio.run(create_tables(True))
    print('Tables created successfully.')

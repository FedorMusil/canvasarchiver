from get_db_conn import get_db_conn


# Warning Do not run this script unless you want to destroy the existing tables and recreate them.
# This script is used to create the tables in the database. It will first
# drop the existing tables if destroy_existing_tables is True.


async def create_tables(destroy_existing_tables=False):
    '''Creates the tables in the database. If destroy_existing_tables is True, it will first drop the existing tables.
       Warning: This will delete all data in the tables. Use with caution.'''
    conn = await get_db_conn()

    if destroy_existing_tables:

        print('Destroying existing tables...')
        await conn.execute('''


        DROP TABLE IF EXISTS annotations;
        DROP TABLE IF EXISTS changes;
        DROP TABLE IF EXISTS teacher_courses;
        DROP TABLE IF EXISTS users;
        DROP TABLE IF EXISTS courses;

        DROP TYPE IF EXISTS change_type;
        DROP TYPE IF EXISTS item_types;
        DROP TYPE IF EXISTS user_role;

        ''')

    print('Creating tables...')
    await conn.execute('''
    CREATE TYPE change_type AS ENUM ('Deletion', 'Addition', 'Modification');
    CREATE TYPE item_types AS ENUM ('Course', 'Assignment', 'Page', 'File', 'Quiz', 'Module', 'Section');
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
        older_diff INT REFERENCES changes(id) NULL,
        diff TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS annotations (
        id SERIAL PRIMARY KEY,
        change_id INT REFERENCES changes(id),
        user_id INT REFERENCES users(id),
        text TEXT NOT NULL,
        timestamp TIMESTAMP NOT NULL
    );
    ''')

    await conn.close()


if __name__ == '__main__':
    import asyncio
    asyncio.run(create_tables(True))
    print('Tables created successfully.')

import asyncpg
from dotenv import load_dotenv
from os import getenv, path

script_dir = path.dirname(path.abspath(__file__))
dotenv_path = path.join(script_dir, '../.env')

load_dotenv(dotenv_path=dotenv_path, encoding='utf-8')

db_params = {
    'user': getenv('DB_USER'),
    'password': getenv('DB_PASSWORD'),
    'host': getenv('DB_HOST'),
    'port': getenv('DB_PORT'),
    'database': 'postgres'  # connect to default database to execute CREATE DATABASE command
}


async def get_db_conn():
    # Connect to your postgres DB
    conn = await asyncpg.connect(**db_params)

    # Check if database exists
    exists = await conn.fetchrow("SELECT 1 FROM pg_catalog.pg_database WHERE datname = $1", getenv('DB_NAME'))
    if not exists:
        # Can't create database from within another connection, so disconnect
        await conn.close()

        # Connect to the default database to create the new database
        conn = await asyncpg.connect(**db_params)
        await conn.execute(f"CREATE DATABASE {getenv('DB_NAME')}")

    return conn


async def create_pool():
    pool = await asyncpg.create_pool(**db_params)
    return pool


if __name__ == '__main__':
    import asyncio
    asyncio.run(get_db_conn())
    print('Connected to database successfully.')

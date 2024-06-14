import psycopg2
from psycopg2 import sql
from dotenv import load_dotenv
from os import getenv, path


script_dir = path.dirname(path.abspath(__file__))
dotenv_path = path.join(script_dir, '../.env')

load_dotenv(dotenv_path=dotenv_path, encoding='utf-8')


def get_db_conn():
    # Define your database connection parameters
    db_params = {
        'user': getenv('DB_USER'),
        'password': getenv('DB_PASSWORD'),
        'host': getenv('DB_HOST'),
        'port': getenv('DB_PORT'),
        'dbname': 'postgres'  # connect to default database to execute CREATE DATABASE command
    }

    # Connect to your postgres DB
    conn = psycopg2.connect(**db_params)

    # Open a cursor to perform database operations
    cur = conn.cursor()

    # Check if database exists
    cur.execute(
        "SELECT 1 FROM pg_catalog.pg_database WHERE datname = %s",
        (getenv('DB_NAME'),)
    )
    exists = cur.fetchone()
    if not exists:
        # Can't create database from within another connection, so disconnect
        cur.close()
        conn.close()

        # Connect to the default database to create the new database
        conn = psycopg2.connect(**db_params)
        conn.set_isolation_level(
            psycopg2.extensions.ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()
        cur.execute(sql.SQL("CREATE DATABASE {}").format(
            sql.Identifier(getenv('DB_NAME')))
        )

    # Close the cursor and connection
    cur.close()
    conn.close()

    # Connect to the new database and return the connection
    db_params['dbname'] = getenv('DB_NAME')
    return psycopg2.connect(**db_params)

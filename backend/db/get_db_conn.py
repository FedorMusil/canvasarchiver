from dotenv import load_dotenv
from psycopg2 import connect
from os import getenv

load_dotenv(dotenv_path='../../.env', encoding='utf-8')


def get_db_conn():
    return connect(
        dbname=getenv('DB_NAME'),
        user=getenv('DB_USER'),
        password=getenv('DB_PASSWORD'),
        host=getenv('DB_HOST'),
        port=getenv('DB_PORT')
    )

from get_db_conn import get_db_conn
import json
import asyncio


async def main():
    db_conn = await get_db_conn()

    tables = await db_conn.fetch('''
        SELECT tablename
        FROM pg_catalog.pg_tables
        WHERE schemaname != 'pg_catalog' AND
                schemaname != 'information_schema';
    ''')

    for table in tables:
        table_name = table['tablename']
        rows = await db_conn.fetch(f'SELECT * FROM {table_name} LIMIT 5')
        print(f'Table: {table_name}')
        for row in rows:
            print(row)

    await db_conn.close()


if __name__ == '__main__':
    asyncio.run(main())

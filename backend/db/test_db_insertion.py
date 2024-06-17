import asynctest
import json
from get_db_conn import get_db_conn


class TestDatabaseInsertion(asynctest.TestCase):
    async def setUp(self):
        self.db_conn = await get_db_conn()

    async def tearDown(self):
        await self.db_conn.close()

    async def test_insertion(self):
        cdata = {
            'name': 'Random Course',
            'course_code': 'HIHI69RAND'
        }

        course_id = await self.db_conn.fetchval('''
            INSERT INTO courses (name, course_code)
            VALUES ($1, $2)
            RETURNING id
        ''', cdata['name'], cdata['course_code'])

        change_id = await self.db_conn.fetchval('''
            INSERT INTO changes (course_id, item_id, change_type, timestamp, item_type, diff)
            VALUES ($1, 1, 'Addition', NOW(), 'Course', $2)
            RETURNING id
        ''', course_id, json.dumps(cdata))

        result = await self.db_conn.fetchrow('''
            SELECT * FROM changes
            WHERE id = $1
        ''', change_id)

        self.assertEqual(result['course_id'], course_id)
        self.assertEqual(result['item_id'], 1)
        self.assertEqual(result['change_type'], 'Addition')
        self.assertEqual(result['item_type'], 'Course')
        self.assertEqual(json.loads(result['diff']), cdata)

        await self.db_conn.execute('''
            DELETE FROM changes
            WHERE id = $1
        ''', change_id)

        await self.db_conn.execute('''
            DELETE FROM courses
            WHERE id = $1
        ''', course_id)


if __name__ == '__main__':
    asynctest.main()

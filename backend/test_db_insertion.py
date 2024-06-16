import unittest
import json
from db.get_db_conn import get_db_conn
import psycopg2.extras


class TestDatabaseInsertion(unittest.TestCase):
    def setUp(self):
        self.db_conn = get_db_conn()
        self.cur = self.db_conn.cursor(
            cursor_factory=psycopg2.extras.DictCursor)

    def tearDown(self):
        self.cur.close()
        self.db_conn.close()

    def test_insertion(self):
        cdata = {
            'name': 'Random Course',
            'course_code': 'HIHI69RAND'
        }

        self.cur.execute('''
            INSERT INTO courses (name, course_code)
            VALUES (%s, %s)
            RETURNING id
        ''', (cdata['name'], cdata['course_code']))
        self.db_conn.commit()
        course_id = self.cur.fetchone()['id']

        self.cur.execute('''
            INSERT INTO changes (course_id, change_type, timestamp, item_type, diff)
            VALUES (%s, 'Addition', NOW(), 'Course', %s)
            RETURNING id
        ''', (course_id, json.dumps(cdata)))
        self.db_conn.commit()

        change_id = self.cur.fetchone()['id']

        self.cur.execute('''
            SELECT * FROM changes
            WHERE id = %s
        ''', (change_id,))

        result = self.cur.fetchone()

        self.assertEqual(result['course_id'], course_id)
        self.assertEqual(result['change_type'], 'Addition')
        self.assertEqual(result['item_type'], 'Course')
        self.assertEqual(json.loads(result['diff']), cdata)

        self.cur.execute('''
            DELETE FROM changes
            WHERE id = %s
        ''', (change_id,))
        self.db_conn.commit()

        self.cur.execute('''
            DELETE FROM courses
            WHERE id = %s
        ''', (course_id,))
        self.db_conn.commit()


if __name__ == '__main__':
    unittest.main()

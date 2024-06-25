import asynctest
import json
from datetime import datetime
import asyncio
import program as prog
import controllers.frontend_api as fapi
import cron_job
import subprocess
import tempfile


def get_patched(json_data, patch):
    json_diff_path = './json/json'
    str1 = json.dumps(json_data)
    str2 = json.dumps(patch)
    with tempfile.TemporaryFile() as f:
        f.write(b'patch')
        f.write(b'\n')
        f.write(str1.encode())
        f.write(b'\n')
        f.write(str2.encode())
        f.seek(0)

        file_content = f.read()
        process = subprocess.Popen(
            [json_diff_path],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )

        output = process.communicate(input=file_content)[0].decode()
        return json.loads(output.rstrip('\n'))


class Item:
    def __init__(self):
        self.data = {
            'name': 'Random Course',
            'course_code': 'HIHI69RAND'
        }

    def get_data(self):
        return self.data


class TestDiffDetection(asynctest.TestCase):
    async def setUp(self):
        self.pool = await cron_job.create_pool()

    async def tearDown(self):
        await self.pool.close()

    async def test_diff_detection(self):
        item = Item()
        cdata = item.get_data()

        course_id = 1
        course = prog.CourseCreate(
            name=cdata['name'],
            course_code=cdata['course_code']
        )

        err, course_id = await fapi.post_course(self.pool, course_id, course.name, course.course_code)
        self.assertEqual(err, 200)
        item.data['id'] = course_id

        request = prog.ChangeCreate(
            item_id=course_id,
            course_id=course_id,
            change_type='Addition',
            timestamp=datetime.now(),
            item_type='Courses',
            older_diff=0,
            diff=json.dumps(cdata)
        )

        success, change_id = await fapi.post_change(self.pool, course_id, request)
        self.assertTrue(success)

        item.data['name'] = 'Random Course 2'
        cdata = item.get_data()
        course = prog.CourseCreate(
            name=cdata['name'],
            course_code=cdata['course_code']
        )

        err, msg = await fapi.check_course_create(self.pool, course)
        self.assertEqual(err, 400)

        changes = await fapi.get_changes_by_courseid(self.pool, course_id)
        self.assertEqual(len(changes), 1)

        original_version = json.loads(changes[0]['diff'])

        await cron_job.process_item_diff(self.pool, item, 'Courses', course_id, changes)

        changes = await fapi.get_changes_by_courseid(self.pool, course_id)
        self.assertEqual(len(changes), 2)

        most_recent = cron_job.get_most_recent_change(
            changes, 'Courses', course_id)

        self.assertEqual(most_recent['change_type'], 'Modification')
        self.assertEqual(
            json.loads(most_recent['diff'])['name'],
            'Random Course 2'
        )

        older_diff = await fapi.get_change_by_id(self.pool, most_recent['older_diff'])
        diff = json.loads(older_diff['diff'])
        self.assertEqual(
            json.loads('[{"op": "replace", "path": "/name", "value": "Random Course"}]'),
            diff)

        result = get_patched(json.loads(most_recent['diff']), diff)
        self.assertEqual(result, original_version)

        await fapi.remove_change_by_id(self.pool, most_recent['id'])
        await fapi.remove_change_by_id(self.pool, older_diff['id'])
        await fapi.remove_course_by_id(self.pool, course_id)
        print('Test passed')


if __name__ == '__main__':
    asynctest.main()

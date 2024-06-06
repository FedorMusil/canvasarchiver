from flask import Flask

from db.get_db_conn import get_db_conn
from controllers.canvas_api import get_current_time

app = Flask(__name__)

# Example routes to show how the server works.
# Run the server with `python program.py` and visit the routes in your browser.

@app.route('/')
def index():
    conn = get_db_conn()
    cur = conn.cursor()

    cur.execute('SELECT * FROM users')
    users = cur.fetchall()

    cur.close()
    conn.close()

    print(f'Users: {users}')
    return str(users)

@app.route('/canvas')
def canvas():
    return get_current_time()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

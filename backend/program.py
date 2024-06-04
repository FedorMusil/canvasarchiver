from flask import Flask
from controllers.canvas_api import get_current_time

app = Flask(__name__)

# Example routes to show how the server works.
# Run the server with `python program.py` and visit the routes in your browser.

@app.route('/')
def hello_world():
    return 'Hello, World!'

@app.route('/canvas')
def canvas():
    return get_current_time()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

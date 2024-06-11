from flask import Flask, send_file
import ssl
import os

app = Flask(__name__, static_folder='../frontend/dist', static_url_path='')


@app.route('/')
def hello_world():
    return 'Hello, World!'


@app.route('/canvas')
def canvas():
    from controllers.canvas_api import get_current_time
    return get_current_time()


@app.route('/initiation', methods=['POST'])
def initiation():
    # Serve the React app
    return send_file(os.path.join(app.static_folder, 'index.html'))


if __name__ == '__main__':
    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    context.load_cert_chain(
        '../frontend/localhost.pem',
        '../frontend/localhost-key.pem')
    app.run(host='0.0.0.0', port=3000, debug=True, ssl_context=context)

from flask import Flask, request, send_from_directory, send_file
from flask_cors import CORS
import ssl
import os

app = Flask(__name__, static_folder='../frontend/dist', static_url_path='')
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/')
def hello_world():
    return 'Hello, World!'

@app.route('/canvas')
def canvas():
    from controllers.canvas_api import get_current_time
    return get_current_time()

@app.route('/initiation', methods=['POST'])
def initiation():
    # Handle the POST request here if necessary
    # For now, just log the form data
    print(f'Received form data: {request.form}')
    
    # Serve the React app
    return send_file(os.path.join(app.static_folder, 'index.html'))

@app.route('/<path:path>')
def static_proxy(path):
    # Serve static files from the React app build
    file_path = os.path.join(app.static_folder, path)
    if os.path.exists(file_path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_file(os.path.join(app.static_folder, 'index.html'))

if __name__ == '__main__':
    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    context.load_cert_chain('../frontend/localhost.pem', '../frontend/localhost-key.pem')
    app.run(host='0.0.0.0', port=3000, debug=True, ssl_context=context)

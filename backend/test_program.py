import pytest
from program import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_hello_world(client):
    rv = client.get('/')
    assert rv.status_code == 200

def test_canvas(client):
    rv = client.get('/canvas')
    assert rv.status_code == 200

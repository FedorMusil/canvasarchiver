from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.responses import JSONResponse, RedirectResponse, FileResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer
from datetime import datetime, timedelta, timezone
from jwt.algorithms import RSAAlgorithm
from hashlib import sha1
from db.get_db_conn import get_db_conn
from controllers.frontend_api import *
from pydantic import BaseModel
from typing import Optional
from db.get_db_conn import create_pool
import jwt
import uvicorn, json
import subprocess, os, hmac, secrets, requests
from typing import Dict, Any
from dotenv import load_dotenv
from enum import Enum


load_dotenv()
app = FastAPI()


CLIENT_ID = os.getenv('CLIENT_ID')
frontend_dist_folder = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist')
templates = Jinja2Templates(directory=frontend_dist_folder)

# Mount the dist folder as static files directory
app.mount("/static", StaticFiles(directory=frontend_dist_folder), name="static")


# Create a pool of connections to the database
pool = None

async def startup_event():
    global pool
    pool = await create_pool()  # Create the pool when the application starts

app.add_event_handler("startup", startup_event)

async def shutdown_event():
    await pool.close()  # Close the pool when the application shuts down

app.add_event_handler("shutdown", shutdown_event)

class Material(Enum):
    Assignments = "Assignments"
    Pages = "Pages"
    Files = "Files"
    Quizzes = "Quizzes"
    Modules = "Modules"
    Sections = "Sections"

class User(BaseModel):
    course_id: str


class Annotation(BaseModel):
    course_id: str
    change_id: str


class CourseCreate(BaseModel):
    name: str
    course_code: str


class ChangeCreate(BaseModel):
    item_id: int
    change_type: str
    item_type: str
    older_diff: int
    diff: Dict[str, Any]


class UserCreate(BaseModel):
    email: str
    name: str
    role: str


class CreateAnnotation(BaseModel):
    change_id: int
    annotation: str
    parent_id: Optional[int]
    selection_id: Optional[str]


def get_current_user(request: Request):
    # Get the token from the cookies
    token = request.cookies.get('token')

    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        # Replace 'your-secret-key' with your actual secret key
        payload = jwt.decode(token, os.getenv("JWT_secret"), algorithms=["HS256"])
        return payload
    except (jwt.PyJWTError, AttributeError):
        raise HTTPException(status_code=401, detail="Invalid token")


# For a more clear explanation of the API see: https://github.com/FedorMusil/canvasarchiver/wiki/API



# Get Routes
@app.get("/change/{material_id}", dependencies=[Depends(get_current_user)])
async def return_change_materialid(material_id: str, user: dict = Depends(get_current_user)):
    '''Get a change of a course by the type of material.'''
    return await get_change_by_materialid(pool, user['course_id'], material_id)


@app.get("/changes/recent", dependencies=[Depends(get_current_user)])
async def return_changes_recent(user: dict = Depends(get_current_user)):
    '''Get the recent changes of a course (last 10 changes))'''
    return await get_changes_recent(pool, user['course_id'])


@app.get("/change/{change_id}", dependencies=[Depends(get_current_user)])
async def return_change_by_id(change_id: int, user: dict = Depends(get_current_user)):
    '''Get a change by its change id'''
    return await get_change_by_id(pool, user['course_id'], change_id)


@app.get("/self", dependencies=[Depends(get_current_user)])
async def return_user_info(user: dict = Depends(get_current_user)):
    '''Get your own information.'''
    return await get_user_by_id(pool, user['user_id'], user['course_id'])


@app.get("/self/courses", dependencies=[Depends(get_current_user)])
async def return_self_courses(user: dict = Depends(get_current_user)):
    '''Get all courses of the user.'''
    return await get_courses_by_user(pool, user['user_id'])


@app.get("/annotations/{annotation_id}", dependencies=[Depends(get_current_user)])
async def return_annotation_by_id(annotation_id: int, user: dict = Depends(get_current_user)):
    '''Get annotation by id'''
    return await get_annotation_by_id(pool, user['course_id'], annotation_id)


@app.get("/course/getinfo", dependencies=[Depends(get_current_user)])
async def get_course_info_route(user: dict = Depends(get_current_user)):
    '''Get a course by id.'''
    return await get_course_by_id(pool, user['course_id'])


@app.get("/course/users", dependencies=[Depends(get_current_user)])
async def get_course_users_route(user: dict = Depends(get_current_user)):
    '''Get all users in a course.'''
    return await get_users_by_courseid(pool, user['course_id'])

@app.get("/course/annotations/{change_id}", dependencies=[Depends(get_current_user)])
async def get_annotation(change_id: int, user: dict = Depends(get_current_user)):
    '''Get all annotations for a change.'''
    return await get_annotations_by_changeid(pool, user['course_id'], change_id)

@app.get("/course/changes", dependencies=[Depends(get_current_user)])
async def get_changes(course_id: int, user: dict = Depends(get_current_user)):
    '''Get all changes for a course.'''
    return await get_changes_by_courseid(pool, user['course_id'])




# # Post Routes
# @app.post("/changes/sync", dependencies=[Depends(get_current_user)])
# async def sync_changes(user: dict = Depends(get_current_user)):
#     '''Sync changes from a course.'''
#     return await ...


@app.post("/course/create")
async def post_course_route(course: CourseCreate):
    passed_test, error_message = await check_course_create(pool, course)
    if passed_test != 200:
        raise HTTPException(status_code=400, detail=error_message)
    success, return_message = await post_course(pool, course)
    if success:
        return {"course_id": return_message}
    raise HTTPException(status_code=400, detail=return_message)

@app.post("/annotations", dependencies=[Depends(get_current_user)])
async def post_annotation_route(annotationObject: CreateAnnotation, user: dict = Depends(get_current_user)):
    '''Create an annotation.'''
    passed_test, error_message = await check_annotation_create(pool, user['course_id'], annotationObject.change_id, annotationObject.text)
    if not passed_test:
        raise HTTPException(status_code=400, detail=error_message)
    success, return_message = await post_annotation(pool, annotationObject.change_id, annotationObject.text)
    if success:
        return {"annotation_id": return_message}
    raise HTTPException(status_code=400, detail=return_message)

@app.put("/changes", dependencies=[Depends(get_current_user)])
async def put_change_route(change: ChangeCreate, user: dict = Depends(get_current_user)):
    '''Create a change.'''
    passed_test, error_message = await check_change_create(pool, user["course_id"], change)
    if not passed_test:
        raise HTTPException(status_code=400, detail=error_message)
    success, return_message = await post_change(pool, user["course_id"], change)
    if success:
        return {"change_id": return_message}
    raise HTTPException(status_code=400, detail=return_message)


# Delete routes
@app.delete("annotations/{annotation_id}", dependencies=[Depends(get_current_user)])
async def delete_annotation(annotation_id: int, user: dict = Depends(get_current_user)):
    '''Delete an annotation.'''
    return await delete_annotation_by_id(pool, user['course_id'], annotation_id)


@app.post("/course/{course_id}/user")
async def post_user_route(course_id: int, user: UserCreate):
    '''Create a user.'''
    passed_test, error_message = await check_user_create(pool, course_id, user)
    if not passed_test:
        raise HTTPException(status_code=400, detail=error_message)
    success, return_message = await post_user(pool, course_id, user)
    if success:
        return {"user_id": return_message}
    raise HTTPException(status_code=400, detail=return_message)

state_nonce_store = {}


def clean_expired_state_nonce():
    current_time = datetime.now(timezone.utc)
    expired_keys = [state for state, details in state_nonce_store.items() if details['expiry'] < current_time]
    for key in expired_keys:
        del state_nonce_store[key]


@app.post("/initiation")
async def handle_initiation_post(request: Request):
    clean_expired_state_nonce()

    try:
        form = await request.form()
        data = {key: value for key, value in form.items()}

        print("Request Form Data:", data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid form data: {str(e)}")


    iss = data.get('iss')
    login_hint = data.get('login_hint')
    client_id = data.get('client_id')
    redirect_uri = data.get('target_link_uri')
    message_hint = data.get('lti_message_hint')
    state = secrets.token_urlsafe(16)
    nonce = secrets.token_urlsafe(16)

    state_nonce_store[state] = {'nonce': nonce, 'expiry': datetime.now(timezone.utc) + timedelta(minutes=10)}

    if not all([iss, login_hint, client_id, redirect_uri]):
        return JSONResponse(content={'error': 'Missing required LTI parameters'}, status_code=400)

    oidc_auth_endpoint = "https://sso.test.canvaslms.com/api/lti/authorize_redirect"
    auth_request_params = {
        'scope': 'openid',
        'response_type': 'id_token',
        'client_id': client_id,
        'redirect_uri': 'https://localhost:3000/redirect',
        'lti_message_hint': message_hint,
        'login_hint': login_hint,
        'state': state,
        'response_mode': 'form_post',
        'nonce': nonce,
        'prompt': 'none'
    }

    auth_request_url = f"{oidc_auth_endpoint}?{'&'.join([f'{key}={value}' for key, value in auth_request_params.items()])}"

    return RedirectResponse(url=auth_request_url)


@app.post("/redirect")
async def handle_redirect(request: Request):
    clean_expired_state_nonce()

    data = await request.form()
    id_token = data.get('id_token')
    state = data.get('state')
    client_id = CLIENT_ID

    if not id_token or not state:
        return JSONResponse(content={'error': 'Missing id_token or state'}, status_code=400)

    if state not in state_nonce_store:
        return JSONResponse(content={'error': 'Invalid state parameter'}, status_code=400)
    nonce = state_nonce_store.pop(state)['nonce']

    jwks_url = "https://sso.test.canvaslms.com/api/lti/security/jwks"
    jwks = requests.get(jwks_url).json()

    try:
        header = jwt.get_unverified_header(id_token)
        key = next(key for key in jwks['keys'] if key['kid'] == header['kid'])
        rsa_key = RSAAlgorithm.from_jwk(key)
        payload = jwt.decode(id_token, rsa_key, algorithms=['RS256'], audience=client_id, nonce=nonce)
    except jwt.ExpiredSignatureError:
        return JSONResponse(content={'error': 'Expired JWT token'}, status_code=400)
    except Exception as e:
        print(f"JWT validation error: {e}")
        return JSONResponse(content={'error': 'Invalid JWT'}, status_code=400)

    user_id = payload.get('https://purl.imsglobal.org/spec/lti/claim/lti1p1', {}).get('user_id')
    course_id = payload.get('https://purl.imsglobal.org/spec/lti/claim/custom', {}).get('courseid')

    response = RedirectResponse(url='/')
    response.set_cookie('user_id', user_id, httponly=True, secure=True)
    response.set_cookie('course_id', course_id, httponly=True, secure=True)

    return response


@app.post("/", include_in_schema=False)
async def serve_root():
    index_path = os.path.join(frontend_dist_folder, "index.html")
    if not os.path.exists(index_path):
        raise HTTPException(status_code=404, detail="index.html not found")
    return FileResponse(index_path)

@app.get("/{path:path}", include_in_schema=False)
async def catch_all(path: str):
    file_path = os.path.join(frontend_dist_folder, path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
    else:
        index_path = os.path.join(frontend_dist_folder, "index.html")
        if not os.path.exists(index_path):
            raise HTTPException(status_code=404, detail="index.html not found")
        return FileResponse(index_path)

@app.post("/deploy")
async def deploy(request: Request):
    signature = request.headers.get('X-Hub-Signature')

    # Get the payload
    payload = await request.body()

    # Create a HMAC hex digest of the payload
    secret = os.getenv('GITHUB_WEBHOOK_SECRET').encode()
    digest = 'sha1=' + hmac.new(secret, payload, sha1).hexdigest()

    # Check if the digest matches the signature
    if not hmac.compare_digest(signature, digest):
        raise HTTPException(status_code=400, detail='Invalid signature')

    subprocess.run(['./deploy.sh'], check=True)
    return JSONResponse(content={'message': 'Deployment successful'})

if __name__ == "__main__":
    uvicorn.run(
        "program:app", host="0.0.0.0", port=3000, log_level="info",
        ssl_certfile="../frontend/localhost.pem",
        ssl_keyfile="../frontend/localhost-key.pem"
    )

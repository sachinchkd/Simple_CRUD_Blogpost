import os
from flask import Flask, send_from_directory, send_file
from flask_cors import CORS
from db import db

# Adjust path to work with Vercel's file structure
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, 'Frontend', 'dist')

app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path='/')
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///blog_posts.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path and os.path.exists(os.path.join(FRONTEND_DIR, path)):
        return send_from_directory(FRONTEND_DIR, path)
    
    # Always return index.html for client-side routing
    return send_file(os.path.join(FRONTEND_DIR, 'index.html'))

import routes

# Only create tables if not in serverless environment
with app.app_context():
    try:
        db.create_all()
    except Exception as e:
        print(f"Database creation error: {e}")

# Vercel requires the app to be importable
def create_app():
    return app
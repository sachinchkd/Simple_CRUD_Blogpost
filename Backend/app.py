# from flask import Flask, send_from_directory
# from flask_cors import CORS
# from flask_sqlalchemy import SQLAlchemy
# from db import db
# import os

# # app=Flask(__name__)
# app = Flask(__name__, static_folder='../Frontend/dist', static_url_path='/')
# CORS(app)

# app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///blog_posts.db'
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# db = SQLAlchemy(app)

# frontend_folder = os.path.join(os.getcwd(), '../Frontend/dist')
# dist_folder = os.path.join(frontend_folder, 'dist')

# @app.route('/', defaults={'filename': ''})
# @app.route('/<path:filename>')
# def index(filename):
#     if not filename:
#         return send_from_directory(frontend_folder, 'index.html')
#     return send_from_directory(dist_folder, filename)

# import routes

# with app.app_context():
#     db.create_all()

# if __name__ == '__main__':
#     app.run(debug=True)


import os
import sys
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

# Ensure the correct path is added
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Initialize Flask and configurations
app = Flask(__name__, static_folder='dist', static_url_path='/')
CORS(app)

# Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    'DATABASE_URL', 
    'sqlite:///blog_posts.db'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize SQLAlchemy
db = SQLAlchemy(app)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

import routes

# Initialize Database
def init_db():
    with app.app_context():
        try:
            db.create_all()
        except Exception as e:
            print(f"Database initialization error: {e}")

# Vercel Handler
def handler(req, res):
    init_db()
    return app

# Initialize database when the module is imported
init_db()

# For local development
if __name__ == '__main__':
    app.run(debug=True)
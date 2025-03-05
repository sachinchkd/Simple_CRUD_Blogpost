from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from db import db
import os

# app=Flask(__name__)
app = Flask(__name__, static_folder='../Frontend/dist', static_url_path='/')
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///blog_posts.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

frontend_folder = os.path.join(os.getcwd(), '../Frontend/dist')
dist_folder = os.path.join(frontend_folder, 'dist')

@app.route('/', defaults={'filename': ''})
@app.route('/<path:filename>')
def index(filename):
    if not filename:
        return send_from_directory(frontend_folder, 'index.html')
    return send_from_directory(dist_folder, filename)

import routes

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run()
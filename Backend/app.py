from flask import Flask, send_from_directory
from flask_cors import CORS
from db import db
import os

app = Flask(__name__, static_folder='../Frontend/dist', static_url_path='/')
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///blog_posts.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

import routes

with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

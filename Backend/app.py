from flask import Flask
from flask_cors import CORS
from db import db
import os

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///blog_posts.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

import routes

with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True)
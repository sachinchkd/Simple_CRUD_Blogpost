from flask import Flask,send_from_directory
from flask_cors import CORS
from db import db
import os

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///blog_posts.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

frontend_folder = os.path.join(os.getcwd(),"..","Frontend")
dist_folder = os.path.join(frontend_folder,"dist")

@app.route('/', defaults={"filename": ''})
@app.route('/<path:filename>')
def index(filename):
    if filename == "":
        filename = "index.html"
    return send_from_directory(dist_folder, filename)

import routes

with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True)
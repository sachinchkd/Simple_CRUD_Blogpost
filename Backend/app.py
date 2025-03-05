import os
import sys
import traceback
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# Comprehensive logging and error handling
print("Python Version:", sys.version)
print("Python Path:", sys.path)
print("Current Working Directory:", os.getcwd())

# Try to import SQLAlchemy with error handling
try:
    from flask_sqlalchemy import SQLAlchemy
except Exception as import_error:
    print("SQLAlchemy Import Error:", str(import_error))
    print(traceback.format_exc())
    SQLAlchemy = None

# Create Flask app with extensive error handling
def create_app():
    try:
        # Determine base directory
        BASE_DIR = os.path.dirname(os.path.abspath(__file__))
        print("BASE_DIR:", BASE_DIR)

        # Create Flask app
        app = Flask(__name__, static_folder='dist', static_url_path='/')
        CORS(app)

        # Database configuration with fallback
        app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
            'DATABASE_URL', 
            'sqlite:///blog_posts.db'
        )
        app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

        # Initialize database with comprehensive error handling
        db = None
        if SQLAlchemy:
            try:
                db = SQLAlchemy(app)
                
                # Define model
                class BlogPost(db.Model):
                    id = db.Column(db.Integer, primary_key=True)
                    title = db.Column(db.String(200), nullable=False)
                    content = db.Column(db.Text, nullable=False)
                    date = db.Column(db.DateTime, default=db.func.current_timestamp())

                    def to_json(self):
                        return {
                            'id': self.id,
                            'title': self.title,
                            'content': self.content,
                            'date': self.date.isoformat() if self.date else None
                        }

                # Create tables
                with app.app_context():
                    try:
                        db.create_all()
                    except Exception as db_create_error:
                        print("Database Creation Error:", str(db_create_error))
                        print(traceback.format_exc())

            except Exception as db_init_error:
                print("Database Initialization Error:", str(db_init_error))
                print(traceback.format_exc())
                db = None

        # Debug route
        @app.route('/debug')
        def debug_info():
            return jsonify({
                "status": "ok",
                "python_version": sys.version,
                "base_dir": BASE_DIR,
                "python_path": sys.path,
                "cwd": os.getcwd(),
                "database_status": "initialized" if db else "not initialized"
            })

        # Fallback route
        @app.route('/', defaults={'path': ''})
        @app.route('/<path:path>')
        def catch_all(path):
            print(f"Received path: {path}")
            return f"Catch-all route. Path: {path}", 200

        return app

    except Exception as app_creation_error:
        print("App Creation Error:", str(app_creation_error))
        print(traceback.format_exc())
        raise

# Create the app
try:
    app = create_app()
except Exception as e:
    print("Fatal App Creation Error:", str(e))
    print(traceback.format_exc())
    app = None

# Vercel handler
def handler(req, res):
    if app is None:
        raise Exception("App could not be created")
    return app

# For local development
if __name__ == '__main__':
    if app:
        app.run(debug=True)
    else:
        print("Could not start the application")
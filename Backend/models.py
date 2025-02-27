from app import db
import datetime

class BlogPost(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    date = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    def to_json(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'date': self.date
        }
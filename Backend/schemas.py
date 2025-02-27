from flask_restful import fields

blog_post_fields = {
    'id': fields.Integer,
    'title': fields.String,
    'content': fields.String,
    'date': fields.DateTime
}
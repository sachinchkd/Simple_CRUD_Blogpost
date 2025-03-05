from flask import Flask, request, jsonify
from db import db
from models import BlogPost
from app import app



@app.route('/api/blogs', methods=['GET'])
def get_blogs():
    # Get pagination parameters from query string
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 6, type=int)
    
    # Query with pagination
    pagination = BlogPost.query.order_by(BlogPost.date.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    posts = pagination.items
    results = [post.to_json() for post in posts]
    
    # Return pagination metadata along with results
    return jsonify({
        'blogs': results,
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page,
        'per_page': per_page,
        'has_next': pagination.has_next,
        'has_prev': pagination.has_prev
    }), 200


@app.route('/api/blogs/<int:id>', methods=['GET'])
def get_blog(id):
    post = BlogPost.query.get_or_404(id)
    return jsonify(post.to_json()), 200


@app.route('/api/blogs', methods=['POST'])
def create_blog():
    data = request.get_json()
    new_post = BlogPost(title=data['title'], content=data['content'])
    db.session.add(new_post)
    db.session.commit()
    return jsonify(new_post.to_json()), 201


@app.route('/api/blogs/<int:id>', methods=['PUT', 'PATCH'])
def update_blog(id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON data"}), 400
    blog = BlogPost.query.get(id)
    if not blog:
        return jsonify({"error": "Blog post not found"}), 404

    try:
        if 'title' in data:
            blog.title = data['title']
        if 'content' in data:
            blog.content = data['content']

        db.session.commit()
        return jsonify(blog.to_json()), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@app.route('/api/blogs/<int:id>', methods=['DELETE'])
def delete_blog(id):
    post = BlogPost.query.get_or_404(id)
    db.session.delete(post)
    db.session.commit()
    return '', 204
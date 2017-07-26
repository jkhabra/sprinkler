from flask import Flask, render_template
from os import path
from db.modles import Post, Image
from db.db_session import get_session

app = Flask(__name__)

app.config.update(dict(
    SECRET_KEY = 'admi90900n'
))


@app.route('/')
def show_posts():
    """
    Route to show posts for the logged in user
    """
    db_session = get_session()
    data = db_session.query(Post, Image).join(Image).filter(Image.url is not None)

    return render_template('posts.html', posts=data)

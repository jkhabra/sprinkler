from flask import Flask, render_template, session, redirect, request, flash
from flask.json import jsonify
from flask_login import LoginManager, login_user, logout_user, login_required, current_user, logout_user
from facebook import GraphAPI
from os import path
from models import Post, Image, User
from db import get_session

app = Flask(__name__)

app.config.update(dict(
    SECRET_KEY = 'admi90900n'
))

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

fb_app_id = '1340205306096145'
redirect_uri = 'http://localhost:5000/accept-fb-token'


@login_manager.user_loader
def load_user(id):
    db_session = get_session()
    return db_session.query(User).get(int(id))

@app.route('/')
def login():
    login_url = 'https://www.facebook.com/v2.9/dialog/oauth?' \
                + 'client_id=' + fb_app_id \
                + '&redirect_uri=' + redirect_uri \
                + '&state=randomstrrsssger' \
                + '&response_type=token' \
                + '&scope=public_profile,publish_actions,user_friends,email,manage_pages,publish_pages'

    return render_template('login.html', login_url=login_url)


@app.route('/accept-fb-token')
def accept_fb_token():
    if request.args.get('access_token'):
        fb_token = request.args.get('access_token')

        try:
            graph = GraphAPI(access_token = fb_token)
            profile = graph.get_object('me')
            args = {'fields' : 'id,name,email'}
            profile = graph.get_object('me', **args)
        except Exception as error:
            flash('There is some kind of error, please login again')
            return redirect('/')

        user_id = profile['id']
        name = profile['name']
        email = profile['email']

        db_session = get_session()
        s_user = db_session.query(User).filter(User.email == email).one()

        if not s_user:
            new_user = User(email=email, name=name, access_token=fb_token)
            db_session.add(new_user)
            db_session.commit()
        else:
            s_user.access_token = fb_token

        db_session.commit()
        login_user(s_user)
        db_session.close()

        return redirect('/posts')

    return render_template('fb_token.html')


@app.route('/posts')
@login_required
def show_posts():
    """
    Route to show posts
    """
    db_session = get_session()
    data = db_session.query(Post, Image).join(Image).filter(Image.local_url != None)
    db_session.close()

    return render_template('posts.html', posts=data)


@app.route('/page_selection')
def page_selection():
    return render_template('page_selection.html')


@app.route('/logout')
def logout():
    logout_user()
    return redirect('/') 


@app.route('/publish-photo')
def publish_photo():
    image_id = request.args.get('id')
    db_session = get_session()

    try:
        image_title = db_session.query(Post).filter(Post.id == image_id.split('.')[0]).one()
        image_path = 'web/static/images/{}'.format(image_id)
        accept_token = db_session.query(User).one()
    except Exception as error:
        return jsonify({
            'status': 'error',
            'message': 'Could not find image to publish :-('
        })

    try:
        graph = GraphAPI(accept_token.access_token)
        image = open(path.abspath(image_path), 'rb')

        graph.put_photo(image.read(), message=image_title.title)
    except Exception as error:
        print(error)
        return jsonify({
            'status': 'error',
            'message': 'Could not publish post. Sorry :-('
        })

    db_session.close()

    return jsonify({
        'status': 'success'
    })

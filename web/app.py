from flask import Flask, render_template, session, redirect, request, flash
from flask.json import jsonify
from flask_login import LoginManager, login_user, logout_user, login_required, current_user, logout_user
from facebook import GraphAPI
from os import path
from models import Post, Image, User, SchedulePost
from db import get_session
from huey import RedisHuey

app = Flask(__name__)

app.config.update(dict(
    SECRET_KEY = 'admi90900n'
))

huey = RedisHuey()
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
        sprinkler_user = db_session.query(User).filter(User.email == email).all()

        if not sprinkler_user:
            new_user = User(email=email, name=name, access_token=fb_token)
            db_session.add(new_user)
            db_session.commit()
        else:
            for s in sprinkler_user:
                s.access_token = fb_token

        for s in sprinkler_user:
            global current_user
            current_user = s

        db_session.commit()
        login_user(current_user)
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
    schedule_posts = db_session.query(SchedulePost).filter(SchedulePost.user_id == current_user.id, SchedulePost.status == False)
    notification = db_session.query(SchedulePost).filter(SchedulePost.user_id == current_user.id, SchedulePost.status == True)
    schedule_data = []
    noti_data = []

    for i in schedule_posts:
        title = db_session.query(Post).filter(Post.id == i.post_id).one()
        src = db_session.query(Image).filter(Image.post_id == i.post_id).one()
        schedule_data.append({'id':i.post_id, 'publish_time':i.publish_time, 'title':title.title, 'src':src.local_url})

    for k in notification:
        t = db_session.query(Post).filter(Post.id == k.post_id).one()
        src = db_session.query(Image).filter(Image.post_id == k.post_id).one()
        noti_data.append({'publish_time':k.publish_time, 'title':t.title, 'src':src.local_url})
    db_session.close()

    return render_template('posts.html', posts=data, schedule=schedule_data, noti=noti_data)


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
        accept_token = db_session.query(User).filter(User.id == current_user.id).one()
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


@app.route('/schedule-post')
def schedule_post():
    post_id = request.args.get('post_id')
    publish_time = request.args.get('publish_time')
    db_session = get_session()

    try:
        if not db_session.query(SchedulePost).filter(SchedulePost.post_id == post_id).all():
            new_schedule = SchedulePost(publish_time=publish_time, post_id=post_id, user_id=current_user.id, status=False)
            db_session.add(new_schedule)
            db_session.commit()
    except Exception as error:
        return jsonify({
            'status': 'error',
            'message': 'Could not add post into database :('
        })
    db_session.close()

    return jsonify ({
        'status': 'success'
    })

@app.route('/cancel-schedule-post')
def cancel_schedule_post():
    post_id = request.args.get('post_id')
    db_session = get_session()

    try:
        old_schedule = db_session.query(SchedulePost).filter(SchedulePost.post_id == post_id).one()
        db_session.delete(old_schedule)
        db_session.commit()
    except Exception as error:
        return jsonify({
            'status': 'error',
            'message': 'Could not cancel post into database :('
        })
    db_session.close()

    return jsonify ({
        'status': 'success',
        'message': 'Schedule has been canceled :('
    })

@huey.task()
def scheduler(post_id, user_id):
    db_session = get_session()

    try:
        image_title = db_session.query(Post).filter(Post.id == post_id).one()
        image_path = db_session.query(Image).filter(Image.id == post_id).one()
        accept_token = db_session.query(User).filter(User.id == user_id).one()
    except Exception as error:
        print("There is some kind of error")
    try:
        pathhh= 'web/'+image_path.local_url
        graph = GraphAPI(accept_token.access_token)
        image = open(path.abspath(pathhh), 'rb')
        graph.put_photo(image.read(), message=image_title.title)

        change_status = db_session.query(SchedulePost).filter(SchedulePost.post_id == post_id).one()
        change_status.status = True 
        db_session.commit()
        db_session.close()
    except Exception as error:
        print('Access token expires ')

    print("post has been published")

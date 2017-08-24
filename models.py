from sqlalchemy import Column, ForeignKey, Integer, String, Boolean, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy import create_engine
import datetime

Base = declarative_base()

class RedditUser(Base):
    __tablename__ = 'reddit_user'
    id = Column(Integer, primary_key=True)
    username = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    update_at = Column(DateTime, default=datetime.datetime.utcnow)


class Post(Base):
    __tablename__ = 'post'
    id = Column(Integer, primary_key=True)
    title = Column(String(350))
    link = Column(String(100))
    gilded = Column(Integer)
    post_type = Column(String(20))
    over_18 = Column(String(10))
    post_id = Column(String(25), nullable=False)
    score = Column(Integer)
    source_url = Column(String(300))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    update_at = Column(DateTime, default=datetime.datetime.utcnow)
    reddit_user_id = Column(Integer, ForeignKey('reddit_user.id'))
    reddit_user = relationship(RedditUser)


class Image(Base):
    __tablename__ = 'image'
    id = Column(Integer, primary_key=True)
    url = Column(String(300))
    local_url= Column(String(300))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    update_at = Column(DateTime, default=datetime.datetime.utcnow)
    post_id = Column(Integer, ForeignKey('post.id'))
    post  = relationship(Post)


class User(Base):
    __tablename__ = 'user'
    id = Column(Integer, primary_key=True)
    name = Column(String(50), nullable=False)
    email = Column(String(70), nullable=False)
    access_token = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    update_at = Column(DateTime, default=datetime.datetime.utcnow)

    def is_authenticated(self):
        return True

    def is_active(self):
        return True

    def is_anonymous(self):
        return False

    def get_id(self):
        return self.id


class SchedulePost(Base):
    __tablename__ = 'schedule_posts'
    id = Column(Integer, primary_key=True)
    publish_time = Column(String(15), nullable=False)
    post_id = Column(Integer, ForeignKey('post.id'))
    post = relationship(Post)
    user_id = Column(Integer, ForeignKey('user.id'))
    user = relationship(User)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    update_at = Column(DateTime, default=datetime.datetime.utcnow)

class Comments(Base):
    __tablename__ = 'comments'
    id = Column(Integer, primary_key=True)
    score = Column(Integer)
    source_created_at = Column(DateTime, nullable=False)
    body = Column(String(1000), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    update_at = Column(DateTime, default=datetime.datetime.utcnow)
    reddit_user_id = Column(Integer, ForeignKey('reddit_user.id'))
    reddit_user = relationship(RedditUser)
    post_id = Column(Integer, ForeignKey('post.id'))
    post = relationship(Post)

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Post, RedditUser, User, Base
import os

def get_session():
    engine = create_engine('sqlite:///db/sprinkler.db')

    if os.path.exists('db/sprinkler.db'):
        Base.metadata.bind = engine
        DBSession = sessionmaker(bind=engine)
        session = DBSession()
        return session
    else:
        Base.metadata.create_all(engine)
        return get_session()

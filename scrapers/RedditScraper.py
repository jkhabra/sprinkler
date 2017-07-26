import json
from requests import get
from models import Post, RedditUser, Image
from db import get_session


headers = {
    'user-agent': 'Mozilla/5.0 (iPad; U; CPU OS 3_2_1 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Mobile/7B405'
}


class RedditScraper():
    """
    Create scraper which scraps reddit.com for its posts
    """
    def __init__(self, subreddit):
        self.subreddit = subreddit
        self.top_url = 'https://www.reddit.com//r/{}/controversial.json'.format(self.subreddit)

    def parse(self):
        """
        Returns list of `Post`s and assign them to `self.posts`
        """
        raw_data = get(self.top_url, headers=headers).content
        data = json.loads(raw_data)

        raw_posts = data.get('data').get('children')
        raw_posts = [p.get('data') for p in raw_posts]
        posts = []

        for raw_post in raw_posts:
            post_type = raw_post['post_hint']

            if post_type == 'image' or 'rich:video':
                image_url = raw_post['url']
            else:
                image_url = None

            if post_type == 'link':
                link = raw_post['url']
            else:
                link = None

            title = raw_post['title']
            username = raw_post['author']
            score = raw_post['score']
            comments = None
            source_url = raw_post['permalink']
            post_id = raw_post['id']
            gilded = raw_post['gilded']
            over_18 = raw_post['over_18']
            created = raw_post['created']

            db_session = get_session()

            if not db_session.query(Post).filter(Post.post_id == post_id).all():
                new_reddit_user = RedditUser(username=username)
                new_post = Post(title=title, link=link, gilded=gilded, post_type=post_type, over_18=over_18, post_id=post_id, score=score, source_url=source_url, reddit_user= new_reddit_user )

                new_image = Image(post=new_post, url=image_url)

                db_session.add(new_reddit_user)
                db_session.add(new_post)
                db_session.add(new_image)
                db_session.commit()


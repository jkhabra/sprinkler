from .RedditScraper import RedditScraper

def run_scraper():
    """
    Returns list of posts after running scrapers
    """
    subreddit = 'funny'

    try:
        top = RedditScraper(subreddit)
        posts = top.parse()
    except Exception as e:
        print('Error while parsing top posts: ', e)

    print("Saving  posts to db")

from flask_script import Manager
from . import app
from scrapers import run_scraper
from scrapers.img_downloader import url_from_db, images_downloader, images_to_db

cli = Manager(app)


@cli.command
def scrap():
    """
    Run scrapers
    """
    run_scraper()

@cli.command
def download_images():
    """
    Save urls of images to be downloaded to local files
    """
    url = url_from_db()
    print('getting urls form db')
    print('downloading images.................')
    images_downloader(url)
    print('record saves to db')
    images_to_db()

@cli.command
def web():
    """
    Run the web server
    """
    print('running server for sprinkler')
    app.run(debug=True)

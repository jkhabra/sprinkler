from os import path, listdir, makedirs
from bs4 import BeautifulSoup
from requests import get
import wget
from models import Post, Image
from db import get_session


def url_from_db():
    db_session = get_session()
    rows = db_session.query(Image).filter(Image.local_url is not None)
    urls = ''

    for row in rows:
        urls += '{}~{}\n'.format(row.id, row.url)

    return urls


def image_url(link):
    soup = BeautifulSoup(get(link).content, 'html.parser')

    try:
        if link.startswith('https://gfycat.com/'):
            url = soup.find('source', {'id': 'mp4Source'})['src']
            return url

        elif link.startswith('http://i.imgur.com/') or link.startswith('https://i.imgur.com/'):
            url = soup.find('div', {'class': 'controls'}).find('a').get('href')
            return 'https:'+ url

        elif link.startswith('http://imgur.com/') or link.startswith('https://imgur.com/'):
            if soup.find('div', {'class': 'video-container'}):
               url = soup.find('div', {'class': 'video-container'}).find('source').get('src')
               gif = 'http:'+url
               if gif.endswith('.gifv'):
                   return image_url(gif)
               return gif

            if soup.find('div', {'class': 'post-image'}):
              url = soup.find('div', {'class': 'post-image'}).find('img').get('src')
              return 'https:'+ url

        elif link.startswith('https://streamable.com/'):
            url = soup.find('source', {'class': 'mp4-source'})['src']
            return 'https:'+ url
        else:
            pass
    except Exception as e:
        print('Image did not find', e)


def images_downloader(urls):
    img_path = './web/static/images/'

    if not path.exists(path.dirname(img_path)):
        try:
            makedirs(path.dirname(img_path))
        except OSError as exc:
            print('file does not exists', exc)
    try:
        if urls == "":
            print('There is no image to download')
            return
        else:
            images = urls.strip().split('\n')
            print('you got {} urls for downloading'.format(len(images)))

            for img in images:
                item = img.split('~')
                print('Downloading image..............{}'.format('image_id: '+item[0]))

                if item[1].endswith('.jpg') or item[1].endswith('.jpeg'):
                    wget.download(item[1], out= img_path+item[0]+'.jpg')
                elif item[1].endswith('.gif'):
                    wget.download(item[1], out= img_path+item[0]+'.gif')
                elif item[1].endswith('.gifv'):
                    wget.download(image_url(item[1]), out= img_path+item[0]+'.gif')
                elif item[1].endswith('.png'):
                    wget.download(item[1], out= img_path+item[0]+'.png')
                elif item[1].endswith('.mp4'):
                    wget.download(item[1], out=img_path+item[0]+'.mp4')
                else:
                    link = image_url(item[1])
                    url = '{}~{}'.format(item[0], link)
                    images_downloader(url)

    except Exception as e:
        print('Image id {} does not exist'.format(item[0]), e)


def images_to_db():
    img = []

    for image in listdir('./web/static/images'):
        if image.endswith('.jpg') or image.endswith('.gif') or image.endswith('.png') or image.endswith('.mp4'):
            img.append(image)

    for i in img:
        urls = i.strip().split('.')
        img_id = urls[0]
        local_url = 'static/images/'+i

        db_session = get_session()
        old_image = db_session.query(Image).filter(Image.id == img_id)

        if old_image:
            query = old_image.one()
            query.local_url = local_url
        else:
            query = Image(local_url=local_url)
            db_session.add(query)

        db_session.commit()


from web.app import huey
from web.app import scheduler
from datetime import datetime
from models import Post, Image, User, SchedulePost
from db import get_session

if __name__ == '__main__':
    db_session = get_session()
    schedule_posts = db_session.query(SchedulePost)

    for i in schedule_posts:
        print(i.status)
        if i.status != True:
            run_time = i.publish_time + ':20'
            post_id = i.post_id
            user_id = i.user_id

            time_format = '%H:%M:%S'
            current_time = datetime.now().time().strftime(time_format)
            tdelta = datetime.strptime(run_time, time_format) - datetime.strptime(current_time, time_format)
            print(current_time)
            print(tdelta)

            scheduler.schedule(args=(post_id, user_id), delay=tdelta.seconds)
            print('Job queued')
        else:
            print('This post has been already published')

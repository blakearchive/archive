__author__ = 'nathan'

import tablib
from sqlalchemy.orm import sessionmaker

import models, config


def main():
    featured_works = tablib.Dataset()
    with open("static/csv/home-page-images.csv") as f:
        featured_works.csv = f.read()
    engine = models.db.create_engine(config.db_connection_string)
    session = sessionmaker(bind=engine)()
    for entry in featured_works:
        session.add(models.BlakeFeaturedWork(dbi=entry[0].encode("utf-8"),
                                             desc_id=entry[1].encode("utf-8"),
                                             byline=entry[2].encode("utf-8"),
                                             title=entry[3].encode("utf-8")))
    session.commit()


if __name__ == "__main__":
    main()
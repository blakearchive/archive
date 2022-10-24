__author__ = 'nathan'

import argparse

import tablib
from sqlalchemy.orm import sessionmaker

import config
import models
from string_helpers import convert_to_string


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("data_folder")
    args = parser.parse_args()
    featured_works = tablib.Dataset()
    with open(args.data_folder + "/csv/home-page-images.csv") as f:
        featured_works.csv = f.read()
    engine = models.db.create_engine(config.db_connection_string, {})
    session = sessionmaker(bind=engine)()
    for entry in featured_works:
        session.add(models.BlakeFeaturedWork(dbi=convert_to_string(entry[0]),
                                             desc_id=convert_to_string(entry[1]),
                                             byline=convert_to_string(entry[2]),
                                             title=convert_to_string(entry[3]),
                                             bad_id=convert_to_string(entry[4])))
    session.commit()


if __name__ == "__main__":
    main()

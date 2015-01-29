__author__ = 'nathan'
import json
import pysolr

import models


def main():
    from sqlalchemy.orm import sessionmaker

    solr = pysolr.Solr('http://ctools-dev.its.unc.edu:8983/solr/blake/')

    engine = models.db.create_engine('postgres://bad_test:insecure_password@treehug.its.unc.edu/bad_test')
    session = sessionmaker(bind=engine)()

    objects = session.query(models.BlakeObject).all()
    for blake_object in objects:
        solr.add([{
            "id": blake_object.object_id,
            "title": blake_object.title,
            "bentley_id": blake_object.bentley_id,
            "characteristics": json.dumps(blake_object.characteristics),
            "illustration_description": json.dumps(blake_object.illustration_description),
            "text": json.dumps(blake_object.text),
            "notes": json.dumps(blake_object.notes),
            "copy_title": blake_object.copy.title,
            "work_title": blake_object.copy.work.title,
            "work_medium": blake_object.copy.work.medium,
            "composition_date": blake_object.copy.work.composition_date,
            "institution": blake_object.copy.institution
        }])
    solr.optimize()

if __name__ == "__main__":
    main()
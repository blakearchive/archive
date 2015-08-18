__author__ = 'nathan'
import json
import pysolr

import models


def main():
    from sqlalchemy.orm import sessionmaker

    blake_object_solr = pysolr.Solr('http://ctools-dev.its.unc.edu:8983/solr/blake-object')
    blake_work_solr = pysolr.Solr('http://ctools-dev.its.unc.edu:8983/solr/blake-work')
    engine = models.db.create_engine('postgres://bad_test:insecure_password@treehug.its.unc.edu/bad_test')
    session = sessionmaker(bind=engine)()
    objects = session.query(models.BlakeObject).all()
    blake_object_solr.delete(q='*:*')
    for blake_object in objects:
        obj = {
            "id": blake_object.object_id,
            "title": blake_object.title,
            "bentley_id": blake_object.bentley_id,
            "dbi": blake_object.dbi,
            "desc_id": blake_object.desc_id,
            "copy_id": blake_object.copy_bad_id,
            "components": json.dumps(blake_object.components),
            "illustration_description": json.dumps(blake_object.illustration_description),
            "text": json.dumps(blake_object.text),
            "copy_title": blake_object.copy.title,
            "copy_institution": blake_object.copy.institution
        }
        if blake_object.copy.work:
            obj["work_title"] = blake_object.copy.work.title
            obj["copy_composition_date"] = blake_object.copy.work.composition_date
            obj["work_medium"] = blake_object.copy.work.medium
        blake_object_solr.add([obj])
    blake_object_solr.optimize()
    works = session.query(models.BlakeWork).all()
    blake_work_solr.delete(q='*:*')
    for blake_work in works:
        blake_work_solr.add([{
            "id": blake_work.work_id,
            "bad_id": blake_work.bad_id,
            "title": blake_work.title,
            "medium": blake_work.medium,
            "info": blake_work.info,
            "image": blake_work.image,
            "composition_date": blake_work.composition_date
        }])
    blake_work_solr.optimize()

if __name__ == "__main__":
    main()
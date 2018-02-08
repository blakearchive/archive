__author__ = 'nathan'
import json
import pysolr
import config
import models
import unicodedata


def main():
    from sqlalchemy.orm import sessionmaker

    if hasattr(config, "solr") and config.solr == "lib_prod":
        blake_object_solr = pysolr.Solr('http://webapp.lib.unc.edu:8200/solr/blake/blake_object')
        blake_copy_solr = pysolr.Solr('http://webapp.lib.unc.edu:8200/solr/blake/blake_copy')
        blake_work_solr = pysolr.Solr('http://webapp.lib.unc.edu:8200/solr/blake/blake_work')
    elif hasattr(config, "solr") and config.solr == "lib_dev":
        blake_object_solr = pysolr.Solr('http://london.libint.unc.edu:8983/solr/blake_object')
        blake_copy_solr = pysolr.Solr('http://london.libint.unc.edu:8983/solr/blake_copy')
        blake_work_solr = pysolr.Solr('http://london.libint.unc.edu:8983/solr/blake_work')
    else:
        blake_object_solr = pysolr.Solr('http://localhost:8983/solr/blake_object')
        blake_copy_solr = pysolr.Solr('http://localhost:8983/solr/blake_copy')
        blake_work_solr = pysolr.Solr('http://localhost:8983/solr/blake_work')

    engine = models.db.create_engine(config.db_connection_string)
    session = sessionmaker(bind=engine)()
    objects = session.query(models.BlakeObject).all()
    blake_object_solr.delete(q='*:*')
    for blake_object in objects:
        try:
            if blake_object.supplemental is None:
                obj = {
                    "id": blake_object.object_id,
                    "title": blake_object.title,
                    "bentley_id": blake_object.bentley_id,
                    "dbi": blake_object.dbi,
                    "desc_id": blake_object.desc_id,
                    "copy_id": blake_object.copy_bad_id,
                    "characteristics": blake_object.characteristics,
                    "components": json.dumps(blake_object.components),
                    "illustration_description": json.dumps(blake_object.illustration_description + ' ' + ' '.join([c['#text'] for c in blake_object.components ] if c is not None)),
                    "text": json.dumps(blake_object.text),
                    "copy_title": blake_object.copy.title,
                    "copy_institution": blake_object.copy.institution,
                    # FIXME: properly convert unicode rather than stripping characters
                    "notes": json.dumps([unicodedata.normalize('NFKD', note["note"]).encode('ascii', 'ignore') for note in blake_object.notes])
                }
                print obj["id"]
                if blake_object.copy.work:
                    obj["work_title"] = blake_object.copy.work.title
                    obj["work_id"] = blake_object.copy.work.bad_id
                    obj["composition_date"] = blake_object.copy.composition_date
                    obj["print_date"] = blake_object.copy.print_date
                    obj["medium"] = blake_object.copy.work.medium
                blake_object_solr.add([obj])
        except pysolr.SolrError as err:
            print err
    blake_object_solr.optimize()

    copies = session.query(models.BlakeCopy).all()
    blake_copy_solr.delete(q='*:*')
    for blake_copy in copies:
        copy_ = {
            "id": blake_copy.copy_id,
            "bad_id": blake_copy.bad_id,
            "source": blake_copy.source,
            "title": blake_copy.title,
            "institution": blake_copy.institution,
            "header": blake_copy.header,
            "composition_date": blake_copy.composition_date,
            "print_date": blake_copy.print_date,
            "effective_copy_id": blake_copy.effective_copy_id
        }
        if blake_copy.work:
            copy_["medium"] = blake_copy.work.medium
            copy_["work_id"] = blake_copy.work.bad_id
        blake_copy_solr.add([copy_])
    blake_copy_solr.optimize()

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
            "composition_date": blake_work.composition_date,
            "composition_date_string": blake_work.composition_date_string
        }])
    blake_work_solr.optimize()

if __name__ == "__main__":
    main()
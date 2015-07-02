import pysolr
from sqlalchemy.sql import func
import copy
import json
import models


blake_object_solr = pysolr.Solr('http://ctools-dev.its.unc.edu:8983/solr/blake-object')
blake_work_solr = pysolr.Solr('http://ctools-dev.its.unc.edu:8983/solr/blake-work')


class BlakeDataService(object):
    """
    Service wrapper used for accessing data.  The API of this object should be kept synchronized with the
    front-end BlakeDataService.
    """

    @classmethod
    def query_objects(cls, config):
        def transform_result(result):
            new_result = copy.copy(result)
            new_result["text"] = json.loads(result["text"])
            new_result["components"] = json.loads(result["components"])
            new_result["illustration_description"] = json.loads(result["illustration_description"])
            return new_result

        def generate_work_query(config):
            query = 'title:"%s"' % config.get("searchString")
            if config.get("searchWorkInformation"):
                query += ' OR info:"%s"' % config.get("searchString")
            if config.get("useCompDate"):
                min_date = config.get("minDate", '*')
                max_date = config.get("maxDate", '*')
                query = "(%s) AND composition_date:[%s TO %s]" % (query, min_date, max_date)
            return query

        def generate_object_query(config):
            query = 'title:"%s"' % config.get("searchString")
            if config.get("searchImageKeywords"):
                query += " OR components:%s" % config.get("searchString")
            if config.get("searchImageDescription"):
                query += " OR illustration_description:%s" % config.get("searchString")
            if config.get("useCompDate") or config.get("usePrintDate"):
                min_date = config.get("minDate", '*')
                max_date = config.get("maxDate", '*')
                comp_date_string = "copy_composition_date:[%s TO %s]" % (min_date, max_date)
                print_date_string = "copy_print_date:[%s TO %s]" % (min_date, max_date)
                if config.get("useCompDate") and config.get("usePrintDate"):
                    query = "(%s) AND (%s OR %s)" % (query, comp_date_string, print_date_string)
                elif config.get("useCompDate"):
                    query = "(%s) AND %s" % (query, comp_date_string)
                else:
                    query = "(%s) AND %s" % (query, print_date_string)
            return query
        # updated search
        obj_results = blake_object_solr.search(generate_object_query(config))
        transformed_obj_results = [transform_result(r) for r in obj_results]
        work_results = blake_work_solr.search(generate_work_query(config))
        # We will probably have to knit together results from several queries
        return {"object_results": transformed_obj_results, "work_results": list(work_results)}

    @classmethod
    def get_object(cls, object_id):
        return models.BlakeObject.query.filter(models.BlakeObject.object_id == object_id).first()

    @classmethod
    def get_objects_with_same_motif(cls, object_id):
        object_ = models.BlakeObject.query\
            .filter(models.BlakeObject.object_id == object_id)\
            .order_by(models.BlakeObject.bentley_id)\
            .first()
        return object_.objects_with_same_motif

    @classmethod
    def get_objects_from_same_production_sequence(cls, object_id):
        object_ = models.BlakeObject.query\
            .filter(models.BlakeObject.object_id == object_id)\
            .order_by(models.BlakeObject.bentley_id)\
            .first()
        return object_.objects_from_same_production_sequence

    @classmethod
    def get_objects_from_same_matrix(cls, object_id):
        object_ = models.BlakeObject.query\
            .filter(models.BlakeObject.object_id == object_id)\
            .order_by(models.BlakeObject.bentley_id)\
            .first()
        return object_.objects_from_same_matrix

    @classmethod
    def get_copy(cls, bad_id):
        return models.BlakeCopy.query.filter(models.BlakeCopy.bad_id == bad_id).first()

    @classmethod
    def get_objects_for_copy(cls, bad_id):
        return models.BlakeObject.query\
            .join(models.BlakeCopy)\
            .order_by(models.BlakeObject.bentley_id)\
            .filter(models.BlakeCopy.bad_id == bad_id).all()

    @classmethod
    def get_work(cls, bad_id):
        return models.BlakeWork.query.filter(models.BlakeWork.bad_id == bad_id).first()

    @classmethod
    def get_works(cls):
        return models.BlakeWork.query.all()

    @classmethod
    def get_copies_for_work(cls, bad_id):
        return models.BlakeCopy.query\
            .join(models.BlakeWork)\
            .filter(models.BlakeWork.bad_id == bad_id).all()

    @classmethod
    def get_featured_works(cls, count=20):
        return models.BlakeFeaturedWork.query.order_by(func.random()).limit(count)
from multiprocessing.pool import worker
import re
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

        def generate_search_element(prefix, search_string):
            def generate_element_part(part_text):
                if part_text.lower() in ("and", "or"):
                    return part_text.lower()
                else:
                    return "%s:'%s'" % (prefix, part_text)
            search_string_parts = re.split(r"\s+(and|or)\s+", search_string, flags=re.I)
            return "(" + " ".join(generate_element_part(p) for p in search_string_parts) + ")"

        def transform_result(result):
            new_result = copy.copy(result)
            new_result["text"] = json.loads(result["text"])
            new_result["components"] = json.loads(result["components"])
            new_result["illustration_description"] = json.loads(result["illustration_description"])
            return new_result

        def work_query(config):
            title_results = []
            work_info_results = []
            if config.get("searchTitle"):
                search_string = generate_search_element("title", config.get("searchString"))
                title_results = blake_work_solr.search(search_string)
            if config.get("searchWorkInformation"):
                search_string = generate_search_element("info", config.get("searchString"))
                work_info_results = blake_work_solr.search(search_string)
            return {"title_results": list(title_results), "work_info_results": list(work_info_results)}

        def object_query(config):
            title_results = []
            tag_results = []
            text_results = []
            description_results = []
            if config.get("searchTitle"):
                search_string = generate_search_element("title", config.get("searchString"))
                title_results = blake_object_solr.search(search_string)
            if config.get("searchImageKeywords"):
                search_string = generate_search_element("components", config.get("searchString"))
                tag_results = blake_object_solr.search(search_string)
            if config.get("searchText"):
                search_string = generate_search_element("text", config.get("searchString"))
                text_results = blake_object_solr.search(search_string)
            if config.get("searchImageDescriptions"):
                search_string = generate_search_element("illustration_description", config.get("searchString"))
                description_results = blake_object_solr.search(search_string)
            return {"title_results": [transform_result(r) for r in title_results],
                    "tag_results": [transform_result(r) for r in tag_results],
                    "text_results": [transform_result(r) for r in text_results],
                    "description_results": [transform_result(r) for r in description_results]}
        # updated search
        obj_results = object_query(config)
        work_results = work_query(config)
        # We will probably have to knit together results from several queries
        return {"object_results": obj_results, "work_results": work_results}

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
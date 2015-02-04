import pysolr
from sqlalchemy.sql import func
import copy
import json
import models


solr = pysolr.Solr('http://ctools-dev.its.unc.edu:8983/solr/blake/')


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
            new_result["characteristics"] = json.loads(result["characteristics"])
            new_result["illustration_description"] = json.loads(result["illustration_description"])
            return new_result
        results = solr.search(config["searchString"])
        transformed_results = [transform_result(r) for r in results]
        # We will probably have to knit together results from several queries
        return transformed_results

    @classmethod
    def get_object(cls, object_id):
        return models.BlakeObject.query.filter(models.BlakeObject.object_id == object_id).first()

    @classmethod
    def get_objects_with_same_motif(cls, object_id):
        object_ = models.BlakeObject.query.filter(models.BlakeObject.object_id == object_id).first()
        return []

    @classmethod
    def get_objects_from_same_production_sequence(cls, object_id):
        object_ = models.BlakeObject.query.filter(models.BlakeObject.object_id == object_id).first()
        return object_.objects_from_same_production_sequence

    @classmethod
    def get_objects_from_same_matrix(cls, object_id):
        object_ = models.BlakeObject.query.filter(models.BlakeObject.object_id == object_id).first()
        return object_.objects_from_same_matrix

    @classmethod
    def get_copy(cls, copy_id):
        return models.BlakeCopy.query.filter(models.BlakeCopy.copy_id == copy_id).first()

    @classmethod
    def get_objects_for_copy(cls, copy_id):
        return models.BlakeObject.query\
            .join(models.BlakeCopy)\
            .filter(models.BlakeCopy.copy_id == copy_id).all()

    @classmethod
    def get_work(cls, work_id):
        return models.BlakeWork.query.filter(models.BlakeWork.work_id == work_id).first()

    @classmethod
    def get_works(cls):
        return models.BlakeWork.query.all()

    @classmethod
    def get_copies_for_work(cls, work_id):
        return models.BlakeCopy.query\
            .join(models.BlakeWork)\
            .filter(models.BlakeWork.work_id == work_id).all()

    @classmethod
    def get_featured_works(cls, count=20):
        return models.BlakeFeaturedWork.query.order_by(func.random()).limit(count)
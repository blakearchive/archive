from . import models


class BlakeDataService(object):
    """
    Service wrapper used for accessing data.  The API of this object should be kept synchronized with the
    front-end BlakeDataService.
    """

    @classmethod
    def query(cls, config):
        # Construct a custom query based on the config object
        # assuming config has a property text, the query text to search for
        tsquery = models.db.func.to_tsquery(config.text)
        rank = models.db.func.ts_rank_cd(models.BlakeObject.document_vector, tsquery).label("rank")
        query = models.BlakeObject.query.filter(rank > 0).order_by(models.db.desc(rank))
        # We will probably have to knit together results from several queries
        return query.all()

    @classmethod
    def get_object(cls, object_id):
        return models.BlakeObject.query.filter(models.BlakeObject.object_id == object_id).first()

    @classmethod
    def get_copy(cls, copy_id):
        return models.BlakeCopy.query.filter(models.BlakeCopy.copy_id == copy_id).first()

    @classmethod
    def get_work(cls, work_id):
        return models.BlakeWork.query.filter(models.BlakeWork.work_id == work_id).first()

    @classmethod
    def get_virtual_work_group(cls, virtual_work_group_id):
        clause = models.BlakeVirtualWorkGroup.virtual_work_group_id == virtual_work_group_id
        return models.BlakeVirtualWorkGroup.query.filter(clause).first()

    @classmethod
    def get_comparable_group(cls, comparable_group_id):
        clause = models.BlakeComparableGroup.comparable_group_id == comparable_group_id
        return models.BlakeComparableGroup.query.filter(clause).first()
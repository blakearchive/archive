from . import models


class BlakeDataService(object):
    """
    Service wrapper used for accessing data.  The API of this object should be kept synchronized with the
    front-end BlakeDataService.
    """

    @classmethod
    def query(cls, config):
        # Construct a custom query based on the config object
        tsquery = models.db.func.to_tsquery(config["searchString"])
        obj_rank = models.db.func.ts_rank_cd(models.BlakeObject.document_vector, tsquery).label("obj_rank")
        copy_rank = models.db.func.ts_rank_cd(models.BlakeCopy.document_vector, tsquery).label("copy_rank")
        work_rank = models.db.func.ts_rank_cd(models.BlakeWork.document_vector, tsquery).label("work_rank")
        objects = models.BlakeObject.query.filter(obj_rank > 0).order_by(models.db.desc(obj_rank)).all()
        copies = models.BlakeCopy.query.filter(copy_rank > 0).order_by(models.db.desc(copy_rank)).all()
        works = models.BlakeCopy.query.filter(work_rank > 0).order_by(models.db.desc(work_rank)).all()
        # We will probably have to knit together results from several queries
        return {
            "objects": objects,
            "copies": copies,
            "works": works
        }

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
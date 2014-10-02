from . import models


class BlakeDataService(object):
    """
    Service wrapper used for accessing data.  The API of this object should be kept synchronized with the
    front-end BlakeDataService.
    """

    @classmethod
    def query(cls, config):
        # Construct a custom query based on the config object
        query = models.BlakeObject.query
        # We will probably have to knit together results from several queries
        return query.all()
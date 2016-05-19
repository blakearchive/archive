from multiprocessing.pool import worker
import re
import pysolr
from sqlalchemy.sql import func
import config
import models


if hasattr(config, "solr") and config.solr == "lib_prod":
    blake_object_solr = pysolr.Solr('http://webapp.lib.unc.edu:8200/solr/blake/blake-object')
    blake_copy_solr = pysolr.Solr('http://webapp.lib.unc.edu:8200/solr/blake/blake-copy')
    blake_work_solr = pysolr.Solr('http://webapp.lib.unc.edu:8200/solr/blake/blake-work')
elif hasattr(config, "solr") and config.solr == "lib_dev":
    blake_object_solr = pysolr.Solr('http://webapp-dev.libint.unc.edu:8200/solr/blake/blake-object')
    blake_copy_solr = pysolr.Solr('http://webapp-dev.libint.unc.edu:8200/solr/blake/blake-copy')
    blake_work_solr = pysolr.Solr('http://webapp-dev.libint.unc.edu:8200/solr/blake/blake-work')
elif hasattr(config, "solr") and config.solr == "local":
     blake_object_solr = pysolr.Solr('http://localhost:8983/solr/blake_object')
     blake_copy_solr = pysolr.Solr('http://localhost:8983/solr/blake_copy')
     blake_work_solr = pysolr.Solr('http://localhost:8983/solr/blake_work')
else:
    blake_object_solr = pysolr.Solr('http://ctools-dev.its.unc.edu:8983/solr/blake-object')
    blake_copy_solr = pysolr.Solr('http://ctools-dev.its.unc.edu:8983/solr/blake-copy')
    blake_work_solr = pysolr.Solr('http://ctools-dev.its.unc.edu:8983/solr/blake-work')


class BlakeDataService(object):
    """
    Service wrapper used for accessing data.  The API of this object should be kept synchronized with the
    front-end BlakeDataService.
    """

    @classmethod
    def generate_medium_filter(cls, config):
        mediums = []
        if config["searchIlluminatedBooks"]:
            mediums.append("illbk")
        if config["searchCommercialBookIllustrations"]:
            mediums.extend(["comb", "comdes", "comeng"])
        if config["searchSeparatePrints"]:
            mediums.extend(["spb", "spdes", "speng"])
        if config["searchDrawingsPaintings"]:
            mediums.extend(["cprint", "penc", "penink", "mono", "wc", "paint"])
        if config["searchManuscripts"]:
            mediums.extend(["ms", "ltr", "te"])
        if config["searchRelatedMaterials"]:
            mediums.extend(["rmb", "rmoth"])
        return "(" + " OR ".join("medium: '%s'" % medium for medium in mediums) + ")"

    @classmethod
    def generate_date_filter(cls, config):
        min_date = config.get("minDate", "*")
        max_date = config.get("maxDate", "*")
        return "composition_date: [%s TO %s]" % (min_date, max_date)

    @classmethod
    def generate_element_part(cls, prefix, part_text):
        if part_text.lower() in ("and", "or"):
            return part_text.lower()
        else:
            return "%s:'%s'" % (prefix, part_text)

    @classmethod
    def generate_search_element(cls, prefix, config):
        regex = re.compile(r"\s+(and|or)\s+", re.IGNORECASE)
        search_string_parts = re.split(regex, config["searchString"])
        mediums = cls.generate_medium_filter(config)
        dates = cls.generate_date_filter(config)
        element_parts = " ".join(cls.generate_element_part(prefix, p) for p in search_string_parts)
        return "(" + element_parts + ") AND %s AND %s" % (mediums, dates)

    @classmethod
    def solr_object_query(cls, query):
        def object_results(objects):
            return [[o["value"], o["count"]] for o in objects]

        def copy_results(copies):
            return [[c["value"], c["count"], object_results(c["pivot"])] for c in copies]

        def work_results(works):
            return [[w["value"], w["count"], copy_results(w["pivot"])] for w in works]

        search_parameters = {"facet": "on", "facet.pivot": "work_id,copy_id,id"}
        facets = blake_object_solr.search(query, **search_parameters).facets['facet_pivot'].values()[0]
        return work_results(facets)

    @classmethod
    def solr_copy_query(cls, query):
        def copy_results(copies):
            return [[c["value"], c["count"]] for c in copies]

        def work_results(works):
            return [[w["value"], w["count"], copy_results(w["pivot"])] for w in works]

        search_parameters = {"facet": "on", "facet.pivot": "work_id,bad_id"}
        facets = blake_copy_solr.search(query, **search_parameters).facets['facet_pivot'].values()[0]
        # print work_results(facets)
        return work_results(facets)

    @classmethod
    def query_objects(cls, config):
        results = {"title": [], "tag": [], "text": [], "description": [], "notes": []}
        if config.get("searchTitle"):
            search_string = cls.generate_search_element("title", config)
            results["title"] = cls.solr_object_query(search_string)
        if config.get("searchImageKeywords"):
            search_string = cls.generate_search_element("components", config)
            results["tag"] = cls.solr_object_query(search_string)
        if config.get("searchText"):
            search_string = cls.generate_search_element("text", config)
            results["text"] = cls.solr_object_query(search_string)
        if config.get("searchImageDescriptions"):
            search_string = cls.generate_search_element("illustration_description", config)
            results["description"] = cls.solr_object_query(search_string)
        if config.get("searchNotes"):
            search_string = cls.generate_search_element("notes", config)
            results["notes"] = cls.solr_object_query(search_string)

        def add_object_query_works(results_):
            works = {w.bad_id: w for w in cls.get_works([r[0] for r in results_])}
            return [[works[w].to_dict, c, r] for (w, c, r) in results_]

        return {k: add_object_query_works(v) for (k, v) in results.items()}

    @classmethod
    def query_copies(cls, config):
        results = {"copy-title": [], "copy-info": []}
        if config.get("searchTitle"):
            search_string = cls.generate_search_element("title", config)
            results["copy-title"] = cls.solr_copy_query(search_string)
        if config.get("searchCopyInformation"):
            search_string = cls.generate_search_element("source", config)
            results["copy-info"] = cls.solr_copy_query(search_string)

        def add_copy_query_works(results_):
            works = {w.bad_id: w for w in cls.get_works([r[0] for r in results_])}
            return [[works[w].to_dict, c, r] for (w, c, r) in results_]

        return {k: add_copy_query_works(v) for (k, v) in results.items()}


    @classmethod
    def query_works(cls, config):
        results = {
            "title": {"count": 0, "results": []},
            "info": {"count": 0, "results": []}
        }
        if config.get("searchTitle"):
            offset = config.get("workTitleOffset", 0)
            search_string = cls.generate_search_element("title", config)
            solr_results = blake_work_solr.search(search_string, start=offset)
            results["title"]["results"] = list(solr_results)
            results["title"]["count"] = solr_results.hits
        if config.get("searchWorkInformation"):
            offset = config.get("workInformationOffset", 0)
            search_string = cls.generate_search_element("info", config)
            solr_results = blake_work_solr.search(search_string, start=offset)
            results["info"]["results"] = list(solr_results)
            results["info"]["count"] = solr_results.hits
        return results

    @classmethod
    def get_objects(cls, desc_ids=None):
        if desc_ids:
            results = models.BlakeObject.query.filter(models.BlakeObject.desc_id.in_(desc_ids)).all()
        else:
            results = models.BlakeObject.query.all()
        return results

    @classmethod
    def get_object(cls, desc_id):
        return models.BlakeObject.query.filter(models.BlakeObject.desc_id == desc_id).first()

    @classmethod
    def get_objects_with_same_motif(cls, desc_id):
        object_ = models.BlakeObject.query\
            .filter(models.BlakeObject.desc_id == desc_id)\
            .order_by(models.BlakeObject.bentley_id)\
            .first()
        return object_.objects_with_same_motif

    @classmethod
    def get_objects_from_same_production_sequence(cls, desc_id):
        object_ = models.BlakeObject.query\
            .filter(models.BlakeObject.desc_id == desc_id)\
            .order_by(models.BlakeObject.bentley_id)\
            .first()
        return object_.objects_from_same_production_sequence

    @classmethod
    def get_objects_from_same_matrix(cls, desc_id):
        object_ = models.BlakeObject.query\
            .filter(models.BlakeObject.desc_id == desc_id)\
            .order_by(models.BlakeObject.bentley_id)\
            .first()
        return object_.objects_from_same_matrix

    @classmethod
    def get_copies(cls, bad_ids=None):
        if bad_ids:
            results = models.BlakeCopy.query.filter(models.BlakeCopy.bad_id.in_(bad_ids))
        else:
            results = models.BlakeCopy.query.all()
        return results

    @classmethod
    def get_copy(cls, bad_id):
        return models.BlakeCopy.query.filter(models.BlakeCopy.bad_id == bad_id).first()

    @classmethod
    def get_objects_for_copy(cls, bad_id):
        return models.BlakeObject.query\
            .join(models.BlakeCopy)\
            .order_by(models.BlakeObject.object_number)\
            .filter(models.BlakeCopy.bad_id == bad_id).all()

    @classmethod
    def get_work(cls, bad_id):
        return models.BlakeWork.query.filter(models.BlakeWork.bad_id == bad_id).first()

    @classmethod
    def get_works(cls, bad_ids=None):
        if bad_ids:
            results = models.BlakeWork.query.filter(models.BlakeWork.bad_id.in_(bad_ids)).all()
        else:
            results = models.BlakeWork.query.all()
        return results

    @classmethod
    def get_copies_for_work(cls, bad_id):
        return models.BlakeCopy.query\
            .join(models.BlakeWork)\
            .filter(models.BlakeWork.bad_id == bad_id)\
            .order_by(models.BlakeCopy.print_date).all()

    @classmethod
    def get_featured_works(cls, count=25):
        return models.BlakeFeaturedWork.query.order_by(func.random()).limit(count)

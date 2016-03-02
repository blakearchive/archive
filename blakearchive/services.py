from multiprocessing.pool import worker
import re
import pysolr
from sqlalchemy.sql import func
import copy
import json
import config
import models


if hasattr(config, "solr") and config.solr == "lib_prod":
    blake_object_solr = pysolr.Solr('http://webapp.lib.unc.edu:8200/solr/blake/blake-object')
    blake_work_solr = pysolr.Solr('http://webapp.lib.unc.edu:8200/solr/blake/blake-work')
elif hasattr(config, "solr") and config.solr == "lib_dev":
    blake_object_solr = pysolr.Solr('http://webapp-dev.libint.unc.edu:8200/solr/blake/blake-object')
    blake_work_solr = pysolr.Solr('http://webapp-dev.libint.unc.edu:8200/solr/blake/blake-work')
else:
    blake_object_solr = pysolr.Solr('http://ctools-dev.its.unc.edu:8983/solr/blake-object')
    blake_work_solr = pysolr.Solr('http://ctools-dev.its.unc.edu:8983/solr/blake-work')


class BlakeDataService(object):
    """
    Service wrapper used for accessing data.  The API of this object should be kept synchronized with the
    front-end BlakeDataService.
    """

    @classmethod
    def query(cls, config):

        def generate_medium_filter(config, work=False):
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
            if work:
                field = "medium"
            else:
                field = "work_medium"
            return "(" + " OR ".join("%s: '%s'" % (field, medium) for medium in mediums) + ")"

        def generate_date_filter(config, work=False):
            mindate = config.get("minDate", "*")
            maxdate = config.get("maxDate", "*")
            if work:
                return "composition_date: [%s TO %s]" % (mindate, maxdate)
            else:
                return "copy_composition_date: [%s TO %s]" % (mindate, maxdate)

        def generate_search_element(prefix, config, work=False):
            def generate_element_part(part_text):
                if part_text.lower() in ("and", "or"):
                    return part_text.lower()
                else:
                    return "%s:'%s'" % (prefix, part_text)

            regx = re.compile(r"\s+(and|or)\s+", re.IGNORECASE)
            search_string_parts = re.split(regx, config["searchString"])
            mediums = generate_medium_filter(config, work)
            dates = generate_date_filter(config, work)
            return "(" + " ".join(generate_element_part(p) for p in search_string_parts) + ") AND %s AND %s" % (mediums, dates)

        def work_query(config):
            results = {
                "title": {"count": 0, "results": []},
                "info": {"count": 0, "results": []}
            }
            if config.get("searchTitle"):
                offset = config.get("workTitleOffset", 0)
                search_string = generate_search_element("title", config, work=True)
                solr_results = blake_work_solr.search(search_string, start=offset)
                results["title"]["results"] = list(solr_results)
                results["title"]["count"] = solr_results.hits
            if config.get("searchWorkInformation"):
                offset = config.get("workInformationOffset", 0)
                search_string = generate_search_element("info", config, work=True)
                solr_results = blake_work_solr.search(search_string, start=offset)
                results["info"]["results"] = list(solr_results)
                results["info"]["count"] = solr_results.hits
            return results

        def object_query(config):
            def search(query):

                def object_results(objects):
                    return [[o["value"], o["count"]] for o in objects]

                def copy_results(copies):
                    return [[c["value"], c["count"], object_results(c["pivot"])] for c in copies]

                def work_results(works):
                    return [[w["value"], w["count"], copy_results(w["pivot"])] for w in works]

                search_parameters = {"facet": "on", "facet.pivot": "work_id,copy_id,id"}
                facets = blake_object_solr.search(query, **search_parameters).facets['facet_pivot'].values()[0]
                return work_results(facets)

            results = {"title": [], "tag": [], "text": [], "description": [], "notes": []}
            if config.get("searchTitle"):
                search_string = generate_search_element("title", config, work=False)
                results["title"] = search(search_string)
            if config.get("searchImageKeywords"):
                search_string = generate_search_element("components", config, work=False)
                results["tag"] = search(search_string)
            if config.get("searchText"):
                search_string = generate_search_element("text", config, work=False)
                results["text"] = search(search_string)
            if config.get("searchImageDescriptions"):
                search_string = generate_search_element("illustration_description", config, work=False)
                results["description"] = search(search_string)
            if config.get("searchNotes"):
                search_string = generate_search_element("notes", config, work=False)
                results["notes"] = search(search_string)
            return results

        # def add_object_query_works(results):
            # works = {w.bad_id: w for w in cls.get_works([r[0] for r in results])}
            # return [[works[w].to_dict, c, r] for (w, c, r) in results]

        # updated search
        # obj_results = {k: add_object_query_works(v) for (k, v) in object_query(config).items()}
        # work_results = work_query(config)
        # We will probably have to knit together results from several queries
        # return {"object_results": obj_results, "work_results": work_results}

    @classmethod
    def get_objects(cls, object_ids=None):
        if object_ids:
            results = models.BlakeObject.query.filter(models.BlakeObject.object_id.in_(object_ids)).all()
        else:
            results = models.BlakeObject.query.all()
        return results

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

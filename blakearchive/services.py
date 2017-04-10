import re
import pysolr
from sqlalchemy.sql import func
import models
import config

if hasattr(config, "solr") and config.solr == "local":
    blake_object_solr = pysolr.Solr('http://localhost:8983/solr/blake_object')
    blake_copy_solr = pysolr.Solr('http://localhost:8983/solr/blake_copy')
    blake_work_solr = pysolr.Solr('http://localhost:8983/solr/blake_work')
else:
    blake_object_solr = pysolr.Solr('http://ctools-dev.its.unc.edu/solr/blake-object')
    blake_copy_solr = pysolr.Solr('http://ctools-dev.its.unc.edu/solr/blake-copy')
    blake_work_solr = pysolr.Solr('http://ctools-dev.its.unc.edu/solr/blake-work')


class BlakeDataService(object):
    """
    Service wrapper used for accessing data.  The API of this object should be kept synchronized with the
    front-end BlakeDataService.
    """

    @classmethod
    def generate_medium_filter(cls, cfg):
        mediums = []
        if cfg["searchAllTypes"]:
            return mediums
        else:
            if cfg["searchIlluminatedBooks"]:
                mediums.append("illbk")
            if cfg["searchCommercialBookIllustrations"]:
                mediums.extend(["comb", "comdes", "comeng"])
            if cfg["searchSeparatePrints"]:
                mediums.extend(["spb", "spdes", "speng"])
            if cfg["searchDrawingsPaintings"]:
                mediums.extend(["cprint", "penc", "penink", "mono", "wc", "paint"])
            if cfg["searchManuscripts"]:
                mediums.extend(["ms", "ltr", "te"])
            if cfg["searchRelatedMaterials"]:
                mediums.extend(["rmb", "rmoth"])
            return "(" + " OR ".join("medium: '%s'" % medium for medium in mediums) + ")"

    @classmethod
    def generate_date_filter(cls, cfg):
        min_date = cfg.get("minDate", "*")
        max_date = cfg.get("maxDate", "*")
        date_string = ""
        if cfg.get("searchAllDateTypes"):
            date_ranges = (min_date, max_date, min_date, max_date)
            date_string = "(composition_date: [%s TO %s] OR print_date: [%s TO %s])" % date_ranges
        else:
            if cfg["useCompDate"]:
                date_string = "composition_date: [%s TO %s]" % (min_date, max_date)
            if cfg["usePrintDate"]:
                date_string = "print_date: [%s TO %s]" % (min_date, max_date)
        return date_string

    @classmethod
    def generate_element_part(cls, prefix, part_text):
        if part_text.lower() in ("and", "or"):
            return part_text.lower()
        else:
            return "%s:'%s'" % (prefix, part_text)

    @classmethod
    def generate_search_element(cls, prefix, cfg):
        regex = re.compile(r"\s+(and|or)\s+", re.IGNORECASE)
        search_string_parts = re.split(regex, cfg["searchString"])
        medium_list = cls.generate_medium_filter(cfg)
        mediums = " AND " + medium_list if medium_list else ""
        dates = cls.generate_date_filter(cfg)
        # element_parts = " ".join(cls.generate_element_part(prefix, p) for p in search_string_parts)
        # return prefix + "(" + element_parts.join(" ") + ") AND %s%s" % (dates, mediums)
        return prefix + ":(" + " ".join(search_string_parts) + ") AND %s%s" % (dates, mediums)

    @classmethod
    def solr_object_query(cls, query):
        def object_results(objects):
            return [[o["value"], o["count"]] for o in objects]

        def copy_results(copies):
            return [[c["value"], c["count"], object_results(c["pivot"])] for c in copies]

        def work_results(works):
            return [[w["value"], w["count"], copy_results(w["pivot"])] for w in works]

        search_parameters = {"facet": "on", "facet.pivot": "work_id,copy_id,desc_id"}
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
    def query_objects(cls, cfg):
        results = {"title": [], "tag": [], "text": [], "description": [], "notes": []}
        if cfg.get("searchTitle") or cfg.get("searchAllFields"):
            search_string = cls.generate_search_element("title", cfg)
            results["title"] = cls.solr_object_query(search_string)
        if cfg.get("searchImageKeywords") or cfg.get("searchAllFields"):
            search_string = cls.generate_search_element("characteristics", cfg)
            results["tag"] = cls.solr_object_query(search_string)
        if cfg.get("searchText") or cfg.get("searchAllFields"):
            search_string = cls.generate_search_element("text", cfg)
            results["text"] = cls.solr_object_query(search_string)
        if cfg.get("searchImageDescriptions") or cfg.get("searchAllFields"):
            search_string = cls.generate_search_element("illustration_description", cfg)
            results["description"] = cls.solr_object_query(search_string)
        if cfg.get("searchNotes") or cfg.get("searchAllFields"):
            search_string = cls.generate_search_element("notes", cfg)
            results["notes"] = cls.solr_object_query(search_string)

        def add_object_query_works(results_):
            works = dict((w.bad_id, w) for w in cls.get_works([r[0] for r in results_]))
            return [[works[w].to_dict, c, r] for (w, c, r) in results_]

        return dict((k, add_object_query_works(v)) for (k, v) in results.items())

    @classmethod
    def query_copies(cls, cfg):
        results = {"copy-title": [], "copy-info": []}
        if cfg.get("searchCopies") or cfg.get("searchAllFields"):
            search_string = cls.generate_search_element("source", cfg)
            results["copy-info"] = cls.solr_copy_query(search_string)

        def add_copy_query_works(results_):
            works = dict((w.bad_id, w) for w in cls.get_works([r[0] for r in results_]))
            return [[works[w].to_dict, c, r] for (w, c, r) in results_]

        return dict((k, add_copy_query_works(v)) for (k, v) in results.items())

    @classmethod
    def query_works(cls, cfg):
        results = {
            "title": {"count": 0, "results": []},
            "info": {"count": 0, "results": []}
        }
        if cfg.get("searchWorks") or cfg.get("searchAllFields"):
            search_string = cls.generate_search_element("info", cfg)
            solr_results = blake_work_solr.search(search_string)
            results["info"]["results"] = list(solr_results)
            results["info"]["count"] = solr_results.hits
        return results

    @staticmethod
    def get_virtual_sorted_query():
        query = models.BlakeObject.query \
            .order_by(models.BlakeObject.object_number) \
            .filter(models.BlakeObject.supplemental == None)
        return query

    @staticmethod
    def get_sorted_object_query():
        query = models.BlakeObject.query \
            .order_by(models.BlakeObject.copy_print_date_value,
                      models.BlakeObject.copy_composition_date_value,
                      models.BlakeObject.object_number)\
            .filter(models.BlakeObject.supplemental == None)
        return query

    @classmethod
    def get_objects(cls, desc_ids=None):
        query = cls.get_sorted_object_query()
        if desc_ids:
            results = query.filter(models.BlakeObject.desc_id.in_(desc_ids)).all()
        else:
            results = query.all()
        return results

    @classmethod
    def get_object(cls, desc_id):
        return models.BlakeObject.query.filter(models.BlakeObject.desc_id == desc_id).first()

    @classmethod
    def get_objects_with_same_motif(cls, desc_id):
        obj = cls.get_sorted_object_query().filter(models.BlakeObject.desc_id == desc_id).first()
        if hasattr(obj, 'objects_with_same_motif'):
            return obj.objects_with_same_motif
        else:
            return []

    @classmethod
    def get_objects_from_same_production_sequence(cls, desc_id):
        obj = cls.get_sorted_object_query().filter(models.BlakeObject.desc_id == desc_id).first()
        if hasattr(obj, 'objects_from_same_production_sequence'):
            return obj.objects_from_same_production_sequence
        else:
            return []

    @classmethod
    def get_objects_from_same_matrix(cls, desc_id):
        obj = cls.get_sorted_object_query().filter(models.BlakeObject.desc_id == desc_id).first()
        if hasattr(obj, 'objects_from_same_matrix'):
            return obj.objects_from_same_matrix
        else:
            return []

    @classmethod
    def get_same_matrix_object_from_other_copy(cls, desc_id, bad_id):
        obj = cls.get_sorted_object_query().filter(models.BlakeObject.desc_id == desc_id).first()
        if hasattr(obj, 'objects_from_same_matrix'):
            for myObject in obj.objects_from_same_matrix:
                if(myObject.copy_bad_id == bad_id):
                    return myObject
                else:
                    continue
        else:
            return None

    @classmethod
    def get_textually_referenced_materials(cls, desc_id):
        obj = models.BlakeObject.query.filter(models.BlakeObject.desc_id == desc_id).first()
        return {
            "objects": obj.textually_referenced_objects,
            "copies": obj.textually_referenced_copies,
            "works": obj.textually_referenced_works
        }

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
        vgroups = ['biblicalwc', 'gravepd', 'biblicaltemperas', 'gravewc', 'cpd', 'gravewd', 'pid']
        if any(bad_id in s for s in vgroups):
            query = cls.get_virtual_sorted_query()
        else:
            query = cls.get_sorted_object_query()

        results = query.join(models.BlakeCopy).filter(models.BlakeCopy.bad_id == bad_id).all()
        return results

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
        return models.BlakeCopy.query \
            .join(models.BlakeWork) \
            .filter(models.BlakeWork.bad_id == bad_id) \
            .order_by(models.BlakeCopy.print_date_value, models.BlakeCopy.composition_date_value).all()

    @classmethod
    def get_featured_works(cls, count=25):
        return models.BlakeFeaturedWork.query.order_by(func.random()).limit(count)

    @classmethod
    def get_supplemental_objects(cls, desc_id):
        return models.BlakeObject.query.filter(models.BlakeObject.supplemental == desc_id).all()
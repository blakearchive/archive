import argparse
import glob
import os
import os.path
import json
import re
import pandas
from collections import defaultdict
import itertools
from lxml import etree
import xmltodict
import models
import config
from sqlalchemy.orm import sessionmaker
import titlecase
from tqdm import tqdm
import logging
from collections import namedtuple
import socket

logging.basicConfig()
logger = logging.getLogger('import')
# dtype = defaultdict(lambda: unicode)
# dtype["virtual"] = int


class BlakeImporter(object):
    xslt_xml = etree.parse(open("static/xslt/source.xsl"))
    transform = etree.XSLT(xslt_xml)

    @staticmethod
    def element_to_dict(obj):
        element_xml = etree.tostring(obj, encoding='utf8', method='xml')
        return xmltodict.parse(element_xml, force_cdata=True)

    @staticmethod
    def extract_date(date_string):
        if date_string:
            date_match = re.match("\D*(\d{4})", date_string)
            if date_match:
                return int(date_match.group(1))

    @staticmethod
    def split_ids(id_string):
        return re.split(r",\s*", id_string.lower())


class BlakeDocumentImporter(BlakeImporter):
    def __init__(self, data_folder):
        self.data_folder = data_folder
        self.object_importer = BlakeObjectImporter()
        self.copy_importer = BlakeCopyImporter(self.data_folder, object_importer=self.object_importer)
        self.works = {}
        self.work_info = {}
        self.virtual_works = defaultdict(lambda: set())
        self.relationships_df = pandas.read_csv(self.data_folder + "/csv/blake-relations.csv", encoding="utf-8")
        self.works_df = pandas.read_csv(self.data_folder + "/csv/works.csv", encoding="utf-8")
        self.relationships_df.fillna("", inplace=True)
        self.works_df.fillna("", inplace=True)

    def import_data(self):
        document_pattern = os.path.join(self.data_folder, "works/*.xml")
        info_pattern = os.path.join(self.data_folder, "info/*.xml")
        matching_bad_files = glob.glob(document_pattern)
        matching_info_files = glob.glob(info_pattern)
        self.import_info_files(matching_info_files)
        self.import_bad_files(matching_bad_files)
        self.process_works()
        self.process_relationships()
        self.populate_database()

    # region Info file handling
    def import_info_files(self, info_files):
        for matching_info_file in info_files:
            try:
                self.process_info_file(matching_info_file)
            except ValueError as err:
                logger.error(err.message)

    def process_info_file(self, document):
        root = etree.parse(document).getroot()
        document_name = os.path.split(document)[1]
        # logger.error(document_name)
        self.work_info[document_name] = [self.transform_relationship(r) for r in root.xpath("./related/relationship")]

    @staticmethod
    def transform_relationship(rel):
        rel_text = rel.xpath("text()")
        link = rel.xpath("link")
        if link:
            title = {
                "text": link[0].xpath("string()").encode("utf-8"),
                "link": link[0].attrib["ptr"].encode("utf-8"),
                "type": link[0].attrib["type"].encode("utf-8")
            }
            if link[0].attrib["plate"]:
                title = {
                    "text": link[0].xpath("string()").encode("utf-8"),
                    "link": link[0].attrib["ptr"].encode("utf-8"),
                    "type": link[0].attrib["type"].encode("utf-8"),
                    "plate": link[0].attrib["plate"].encode("utf-8")
                }
        else:
            title = {"text": "".join(i.xpath("string()").encode("utf-8").strip() for i in rel.xpath("i"))}
        result = {"title": title, "info": "<br />".join(rt.encode("utf-8").strip() for rt in rel_text)}
        return result

    # endregion

    def import_bad_files(self, bad_files):
        for matching_file in bad_files:
            try:
                self.copy_importer.process(matching_file)
            except Exception as err:
                logger.error("Error processing BAD [%s]: %s" % (matching_file, err.message))

    # region Relationship processing
    def process_relationships(self):
        for entry in self.relationships_df.itertuples():
            Record = namedtuple('Object',['index','desc_id','dbi','bad_id','virtual_group','same_matrix_ids','same_production_sequence_ids','similar_design_ids','reference_object_ids','reference_copy_ids','reference_work_ids','supplemental_ids'])
            entry = Record(*entry)
            self.process_relationship(entry)

    def process_relationship(self, entry):
        obj = self.object_importer.get(entry.desc_id.lower())
        if not obj:
            return
        obj.objects_from_same_matrix.extend(self.objects_for_id_string(entry.same_matrix_ids))
        obj.objects_from_same_production_sequence.extend(self.objects_for_id_string(entry.same_production_sequence_ids))
        obj.objects_with_same_motif.extend(self.objects_for_id_string(entry.similar_design_ids))
        obj.textually_referenced_objects.extend(self.objects_for_id_string(entry.reference_object_ids))

        referenced_copy_ids = self.split_ids(entry.reference_copy_ids)
        referenced_copies = self.copy_importer.get(referenced_copy_ids)
        obj.textually_referenced_copies.extend(referenced_copies)

        referenced_work_ids = self.split_ids(entry.reference_work_ids)
        referenced_works = [self.works[id_] for id_ in referenced_work_ids if id_ in self.works]
        obj.textually_referenced_works.extend(referenced_works)

    def objects_for_id_string(self, id_string):
        ids = self.split_ids(id_string)
        return self.object_importer.get(ids)

    # endregion

    # region Work processing
    def process_works(self):
        for entry in self.works_df.itertuples():
            Record = namedtuple('Work',['index','title','medium','composition_date','composition_date_value','image','copies','bad_id','info','info_filename','virtual','virtual_objects','preview','preview_copies'])
            entry = Record(*entry)
            if(socket.gethostname() == 'islington.lib.unc.edu' and bool(entry.preview)):
                continue
            else:
                self.process_work(entry)

    def process_work(self, entry):
        bad_id = entry.bad_id or entry.info_filename.split(".", 1)[0]
        work = models.BlakeWork()
        work.title = entry.title.encode('utf-8')
        work.medium = entry.medium
        work.bad_id = bad_id
        work.virtual = bool(entry.virtual)
        work.preview = bool(entry.preview)
        work.composition_date = self.extract_date(entry.composition_date)
        work.composition_date_string = entry.composition_date.encode('utf-8')
        work.composition_date_value = entry.composition_date_value.encode('utf-8')
        work.image = entry.image.encode('utf-8')
        work.info = entry.info.encode('utf-8')
        work.preview_copies = entry.preview_copies.split(",")
        if entry.info_filename in self.work_info:
            work.related_works = self.work_info[entry.info_filename]
        else:
            logger.error("info file does not exist: %s" % entry.info_filename)
        self.works[bad_id] = work
        if(socket.gethostname() == 'islington.lib.unc.edu'):
            diff = set(self.split_ids(entry.copies)) - set(work.preview_copies)
            result = [o for o in self.split_ids(entry.copies) if o in diff]
            all_non_preview_copies = list(result)

            work.copies = self.copy_importer.get(all_non_preview_copies)
        else:
            work.copies = self.copy_importer.get(self.split_ids(entry.copies))
        if work.virtual:
            self.process_virtual_work(entry, work)
        return work

    def process_virtual_work(self, entry, work):
        # Virtual works need to have a special copy created just for them
        if(socket.gethostname() == 'islington.lib.unc.edu'):
            diff = set(self.split_ids(entry.virtual_objects)) - set(work.preview_copies)
            result = [o for o in self.split_ids(entry.virtual_objects) if o in diff]
            all_non_preview_objects = list(result)
            objects = self.objects_sorted_for_virtual_copy(all_non_preview_objects)
        else:
            objects = self.objects_sorted_for_virtual_copy(self.split_ids(entry.virtual_objects))
        copy = models.BlakeCopy()
        copy.work_id = entry.bad_id
        copy.title = entry.title.encode('utf-8')
        copy.image = entry.image
        copy.bad_id = entry.bad_id
        copy.archive_copy_id = entry.bad_id
        copy.composition_date = self.extract_date(entry.composition_date)
        copy.composition_date_string = entry.composition_date
        virtual_group_header = self.virtual_group_header(entry.bad_id)
        if virtual_group_header:
            copy.header = self.element_to_dict(virtual_group_header)
            copy.header_html = self.header_to_html(virtual_group_header)
        # We need to clean-up since we're not using the previously generated copy, but the new virtual copy
        i = 1
        for obj in objects:
            old_copy = obj.copy
            obj.header = old_copy.header
            obj.source = old_copy.source
            if not obj.supplemental:
                obj.object_number = i
                i += 1
            obj.virtualwork_title = work.title
            # obj.full_object_id = re.sub(r"\s*Object 1\s*", "", obj.full_object_id, flags=re.IGNORECASE).rstrip()
            obj.full_object_id = obj.full_object_id.rstrip()
            obj.copy = copy
            obj.object_group = old_copy.title
            old_copy.effective_copy_id = copy.bad_id
            obj.copy_bad_id = copy.bad_id
        work.copies.append(copy)
        self.copy_importer.members[entry.bad_id] = copy

    def objects_sorted_for_virtual_copy(self, copy_bad_ids):
        copies = self.copy_importer.get(copy_bad_ids)
        chained_copies = itertools.chain.from_iterable(c.objects for c in copies)
        return list(chained_copies)

    def virtual_group_header(self, bad_id):
        virtual_copy_source_file = os.path.join(self.data_folder, "groups", bad_id + ".xml")
        if os.path.exists(virtual_copy_source_file):
            return etree.parse(virtual_copy_source_file)

    def header_to_html(self, source_tree):
        transformed_tree = self.transform(source_tree)
        return etree.tostring(transformed_tree)

    # endregion

    def populate_database(self):
        print("populating database")
        engine = models.db.create_engine(config.db_connection_string)
        session = sessionmaker(bind=engine)()
        models.BlakeObject.metadata.drop_all(bind=engine)
        models.BlakeObject.metadata.create_all(bind=engine)
        session.add_all(self.works.values())
        session.add_all(self.object_importer.members.values())
        session.commit()


class BlakeCopyImporter(BlakeImporter):
    def __init__(self, data_folder, object_importer=None):
        self.data_folder = data_folder
        self.object_importer = object_importer or BlakeObjectImporter()
        self.members = {}
        self.copy_handprints = {}
        copy_handprint_df = pandas.read_csv(self.data_folder + "/csv/copy-handprints.csv", encoding="utf-8")
        copy_handprint_df.fillna("", inplace=True)
        for entry in copy_handprint_df.itertuples():
            Record = namedtuple('Copy',['index','bad_id','dbi'])
            entry = Record(*entry)
            self.copy_handprints[entry.bad_id] = entry.dbi.lower()

    def process(self, document):
        root = self.get_document_tree(document)
        bad_xml = etree.tostring(root)
        copy = models.BlakeCopy()
        copy.bad_id = root.get("id").lower()
        copy.composition_date_string = self.get_compdate_string(root)
        copy.composition_date_value = self.get_compdate_value(root)
        copy.composition_date = self.extract_date(copy.composition_date_string)
        copy.print_date_string = self.get_printdate_string(root)
        copy.print_date_value = self.get_printdate_value(root)
        copy.print_date = self.extract_date(copy.print_date_string)
        copy.archive_copy_id = root.get("copy")
        copy.header = self.get_header(root)
        copy.source = self.get_source(root)
        copy.header_html = self.get_header_html(root)
        copy.bad_xml = bad_xml
        copy.objects = [self.object_importer.process(element) for element in root.xpath(".//desc")]
        copy.effective_copy_id = copy.bad_id
        copy.title = self.get_copy_title(root)
        copy.institution = self.get_copy_institution(root)
        copy.medium = root.get("type").encode("utf-8")
        copy.image = self.copy_handprints.get(copy.bad_id)
        self.members[copy.bad_id] = copy
        self.set_object_attributes(copy)
        logger.info("added copy: %s" % copy.bad_id)

    @staticmethod
    def set_object_attributes(copy):
        for (i, obj) in enumerate(copy.objects, 1):
            obj.object_number = i
            obj.copy_id = copy.copy_id
            obj.copy_title = copy.title
            obj.archive_copy_id = copy.archive_copy_id
            obj.copy_institution = copy.institution
            obj.copy_composition_date = copy.composition_date
            obj.copy_composition_date_string = copy.composition_date_string
            obj.copy_composition_date_value = copy.composition_date_value
            obj.copy_print_date = copy.print_date
            obj.copy_print_date_value = copy.print_date_value
            obj.copy_print_date_string = copy.print_date_string
            obj.copy_bad_id = copy.bad_id

    @staticmethod
    def get_compdate_string(document):
        for cd in document.xpath("//compdate"):
            return str(cd.xpath("text()")).strip("'[]'").rstrip().encode("utf-8")

    @staticmethod
    def get_printdate_string(document):
        for pd in document.xpath("//printdate"):
            return str(pd.xpath("text()")).strip("'[]'").rstrip().encode("utf-8")

    @staticmethod
    def get_compdate_value(document):
        for cd in document.xpath("//compdate"):
            return cd.attrib["value"]

    @staticmethod
    def get_printdate_value(document):
        for pd in document.xpath("//printdate"):
            return pd.attrib["value"]

    @staticmethod
    def get_header(document):
        for header in document.xpath("header"):
            header_xml = etree.tostring(header, encoding='utf8', method='xml')
            return json.dumps(xmltodict.parse(header_xml, force_cdata=True)["header"])

    @staticmethod
    def get_source(document):
        for source in document.xpath("objdesc/source"):
            source_xml = etree.tostring(source, encoding='utf8', method='xml')
            return json.dumps(xmltodict.parse(source_xml, force_cdata=True)["source"])

    @classmethod
    def get_header_html(cls, document):
        for header in document.xpath("header"):
            transformed_header = cls.transform(header)
            return etree.tostring(transformed_header)

    @staticmethod
    def get_copy_title(document):
        for title in document.xpath("header/filedesc/titlestmt/title"):
            title_text = title.xpath("string()")
            return re.match(r"(?:(.*):|(.*))", title_text, flags=re.DOTALL).group(1).rstrip().encode("utf-8")

    @staticmethod
    def get_copy_institution(document):
        for institution in document.xpath("//institution"):
            return institution.xpath("string()").encode("utf-8")

    @staticmethod
    def get_document_tree(document):
        if os.path.isfile(document):
            root = etree.parse(document).getroot()
        else:
            root = etree.fromstring(document).getroot()
        if not root.tag == "bad":
            raise ValueError("Document is not a blake archive xml document")
        return root

    def get(self, bad_ids):
        if isinstance(bad_ids, basestring):
            return self.members.get(bad_ids)
        else:
            return [self.members[bad_id] for bad_id in bad_ids if bad_id in self.members]


class BlakeObjectImporter(BlakeImporter):
    xslt_xml = etree.parse(open("static/xslt/transcription.xsl"))
    transform = etree.XSLT(xslt_xml)

    def __init__(self):
        self.members = {}

    def get(self, desc_ids):
        if isinstance(desc_ids, basestring):
            return self.members.get(desc_ids)
        else:
            return [self.members[desc_id] for desc_id in desc_ids if desc_id in self.members]

    def process(self, element):
        obj = models.BlakeObject()
        obj.desc_id = element.attrib.get("id").lower()
        obj.butnumber = re.split('\.|t',obj.desc_id)[1]
        obj.dbi = element.attrib.get("dbi").lower()
        obj.components = self.get_components(element)
        obj.characteristics = self.get_characteristics(element)
        obj.illustration_description = self.get_illustration_description(element)
        obj.notes = self.get_object_notes(element)
        obj.title = self.get_object_title(element)
        obj.text = self.get_text(element)
        obj.markup_text = self.get_markuptext(element)
        obj.full_object_id = self.get_full_object_id(element)
        obj.object_number = self.get_object_number(element)
        obj.bentley_id = self.get_bentley_id(element)
        obj.physical_description = self.get_physical_description(element)
        obj.supplemental = self.supplemental_to(element)
        self.members[obj.desc_id] = obj
        #print 'notes for' + obj.title
        #print obj.notes
        return obj

    @staticmethod
    def get_object_title(obj):
        for title in obj.xpath("objtitle/title"):
            return title.xpath("string()").rstrip().encode("utf-8")
        #else:
        #    for objnumber in obj.xpath(".//objnumber"):
        #        if objnumber.attrib.get("code") == "A1":
        #           return titlecase.titlecase(objnumber.xpath("string()").rstrip().encode("utf-8"))

    @classmethod
    def get_text(cls, obj):
        for phystext in obj.xpath("phystext"):
            return cls.element_to_dict(phystext)["phystext"]

    @classmethod
    def get_markuptext(cls, obj):
        for phystext in obj.xpath("phystext"):
            return etree.tostring(cls.transform(phystext))

    @classmethod
    def get_components(cls, obj):
        def generate_component_markup(obj_desc):
            return etree.tostring(cls.transform(obj_desc))

        def generate_element_dict(comp):
            return cls.element_to_dict(comp)

        def generate_component(comp):
            element_dict = generate_element_dict(comp)
            for obj_desc in comp.xpath("./illusobjdesc"):
                try:
                    component_markup = generate_component_markup(obj_desc)
                    element_dict["component"]["illusobjdesc"]["#text"] = component_markup
                except TypeError:
                    pass
                return element_dict

        def generate_illustration(ill):
            return {
                'type': ill.attrib["type"] if 'type' in ill.attrib else "",
                'location': ill.attrib["location"] if 'location' in ill.attrib else "",
                '#text': etree.tostring(cls.transform(ill.xpath("./illusobjdesc")[0])),
                'components': [generate_component(c) for c in ill.xpath("./component")]
            }

        return [generate_illustration(i) for i in obj.xpath(".//illusdesc/illustration")]

    @classmethod
    def get_characteristics(cls, obj):
        return " ".join(s.encode("utf-8") for s in set(obj.xpath(".//characteristic/text()")))

    @classmethod
    def get_illustration_description(cls, obj):
        for description in obj.xpath("illusdesc/illustration/illusobjdesc"):
            return {'#text': etree.tostring(cls.transform(description))}

    @staticmethod
    def get_full_object_id(obj):
        for objid in obj.xpath("objtitle/objid"):
            return titlecase.titlecase(objid.xpath("string()").rstrip().encode("utf-8"))

    @staticmethod
    def get_object_number(obj):
        for objnumber in obj.xpath("objtitle/objid/objnumber"):
            obj_number = objnumber.get("code").encode("utf-8").upper()
            obj_number_value = re.search(r'\d+', obj_number)
            if obj_number_value:
                return int(obj_number_value.group(0))

    @staticmethod
    def get_bentley_id(obj):
        for objcode in obj.xpath("objtitle/objid/objcode"):
            obj_id = objcode.get("code").encode("utf-8").upper()
            if obj_id.startswith("B"):
                bentley_id = re.search(r'\d+', obj_id)
                if bentley_id:
                    return int(bentley_id.group(0))

    @staticmethod
    def get_object_notes(obj):
        notes = []
        #return [note.xpath("string()") for note in obj.xpath(".//note") + obj.xpath(".//objnote")]
        for note in obj.xpath("./phystext//note") + obj.xpath("./physdesc//objnote"):
            text = note.xpath("string()")
            parent = note.xpath('parent::l')
            if len(parent):
                line = parent[0].attrib["n"].rsplit("." , 1)[1]
                result = {"note": text, "type": "text", "line": line}
            else:
                result = {"note": text, "type": "desc"}
            notes.append(result)
        return notes

    @classmethod
    def get_physical_description(cls, obj):
        for physdesc in obj.xpath("physdesc"):
            return cls.element_to_dict(physdesc)["physdesc"]

    @staticmethod
    def supplemental_to(obj):
        parent = obj.getparent()
        if parent.tag == "supplemental":
            return parent.getparent().get("id")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("data_folder")
    parser.add_argument("-p", "--profile", action="store_true", default=False)
    args = parser.parse_args()
    importer = BlakeDocumentImporter(args.data_folder)
    if args.profile:
        import cProfile
        cProfile.runctx("importer.import_data()", globals(), locals(), filename="import_stats.out")
    else:
        importer.import_data()


if __name__ == "__main__":
    main()

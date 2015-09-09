__author__ = 'nathan'

import argparse
import glob
import os
import json
import tablib
import re
from collections import defaultdict
from lxml import etree

import xmltodict

import models
import config


class BlakeDocumentImporter(object):
    def __init__(self):
        self.works = []
        self.copies = {}
        self.objects = {}
        self.copy_handprint_map = {}
        self.motif_relationships_expanded = defaultdict(lambda: set())
        self.relationships = tablib.Dataset()
        self.motif_relationships = tablib.Dataset()
        self.works_dataset = tablib.Dataset()
        self.copy_handprints = tablib.Dataset()
        with open("static/csv/blake-relations.csv") as f:
            self.relationships.csv = f.read()
        with open("static/csv/same_motif.csv") as f:
            self.motif_relationships.csv = f.read()
        with open("static/csv/copy-handprints.csv") as f:
            self.copy_handprints.csv = f.read()
        for (copy_bad_id, dbi) in self.copy_handprints:
            self.copy_handprint_map[copy_bad_id] = dbi
        for (desc_id, matching_ids, in_archive) in self.motif_relationships:
            desc_id = desc_id.lower()
            matching_ids = matching_ids.lower()
            matching_ids_set = set(matching_ids.split(",") + [desc_id])
            for matching_id in matching_ids_set:
                all_but_current_id = matching_ids_set ^ set([matching_id])
                self.motif_relationships_expanded[matching_id].update(all_but_current_id)
        with open("static/csv/works.csv") as f:
            self.works_dataset.csv = f.read()
        xslt_xml = etree.parse(open("static/xslt/transcription.xsl"))
        self.transform = etree.XSLT(xslt_xml)

    def populate_works(self):
        for work_entry in self.works_dataset:
            composition_date = int(re.search(r"(\d{4})", work_entry[2]).group(1))
            work = models.BlakeWork(title=work_entry[0].encode('utf-8'), medium=work_entry[1],
                                    bad_id=work_entry[5],
                                    composition_date=composition_date,
                                    composition_date_string=work_entry[2].encode('utf-8'),
                                    image=work_entry[3].encode('utf-8'),
                                    info=work_entry[6].encode('utf-8'))
            self.works.append(work)
            for copy in work_entry[4].split(","):

                work.copies.append(self.copies[copy])

    def process_motif_relationships(self):
        for obj in self.objects.values():
            same_motif_objs = [self.objects[desc_id] for desc_id in self.motif_relationships_expanded[obj.desc_id]]
            obj.objects_with_same_motif = same_motif_objs

    def process_relationships(self):
        for relationship in self.relationships:
            obj = self.objects.get(relationship[0].lower())
            same_matrix = []
            same_production_sequence = []
            for desc_id in relationship[4].lower().split(","):
                if self.objects.get(desc_id):
                    same_matrix.append(self.objects.get(desc_id))
            for desc_id in relationship[5].lower().split(","):
                if self.objects.get(desc_id):
                    same_production_sequence.append(self.objects.get(desc_id))
            obj.objects_from_same_matrix.extend(same_matrix)
            obj.objects_from_same_production_sequence.extend(same_production_sequence)

    def process_object(self, obj):

        def element_to_dict(o):
            element_xml = etree.tostring(o, encoding='utf8', method='xml')
            return xmltodict.parse(element_xml, force_cdata=True)

        bo = models.BlakeObject()

        bo.desc_id = obj.attrib.get("id").lower()
        bo.dbi = obj.attrib.get("dbi").lower()
        self.objects[bo.desc_id] = bo
        # We need to pull out the illusdesc and store it separately
        for illustration_description in obj.xpath("illusdesc"):
            components = illustration_description.xpath("illustration/component")
            bo.components = [element_to_dict(c) for c in components]
            for desc in illustration_description.xpath("illustration/illusobjdesc"):
                bo.illustration_description = element_to_dict(desc)
                break
            break
        for phystext in obj.xpath("phystext"):
            bo.text = element_to_dict(phystext)["phystext"]
            break
        for objid in obj.xpath("objtitle/objid"):
            bo.full_object_id = objid.xpath("string()").encode("utf-8")
            break
        for objcode in obj.xpath("objtitle/objid/objcode"):
            obj_id = objcode.get("code").encode("utf-8").upper()
            if obj_id.startswith("B"):
                bentley_id = re.search(r'\d+', obj_id)
                if bentley_id:
                    bo.bentley_id = int(bentley_id.group(0))
                    break
        for title in obj.xpath("objtitle/title"):
            bo.title = title.xpath("string()").encode("utf-8")
            break
        bo.physical_description = element_to_dict(obj.xpath("physdesc")[0])["physdesc"]
        bo.markup_text = str(self.transform(obj))
        return bo

    def process(self, document):
        if os.path.isfile(document):
            root = etree.parse(document).getroot()
        else:
            root = etree.fromstring(document).getroot()
        if not root.tag == "bad":
            raise ValueError("Document is not a blake archive xml document")
        copy_id = root.get("id").lower()
        for comp_date in root.xpath("//compdate"):
            comp_date_string = comp_date.xpath("string()").encode("utf-8")
            comp_date = re.match("\D*(\d{4})", comp_date_string).group(1)
            break
        archive_copy_id = root.get("copy")
        header_xml = etree.tostring(root.xpath("header")[0], encoding='utf8', method='xml')
        header_json = json.dumps(xmltodict.parse(header_xml, force_cdata=True)["header"])
        source_xml = etree.tostring(root.xpath("objdesc/source")[0], encoding='utf8', method='xml')
        source_json = json.dumps(xmltodict.parse(source_xml, force_cdata=True)["source"])
        objects = [self.process_object(o) for o in root.xpath("objdesc/desc")]
        copy = models.BlakeCopy(bad_id=copy_id, header=header_json, source=source_json, objects=objects,
                                composition_date=comp_date, composition_date_string=comp_date_string,
                                archive_copy_id=archive_copy_id)
        if copy_id in self.copy_handprint_map:
            copy.image=self.copy_handprint_map[copy_id]
        else:
            print "No handprint for ", copy_id
        for title in root.xpath("header/filedesc/titlestmt/title"):
            copy.title = title.xpath("string()").encode("utf-8")
            break
        for institution in root.xpath("//institution"):
            copy.institution = institution.xpath("string()").encode("utf-8")
            break
        copy.medium = root.get("type").encode("utf-8")
        self.copies[copy.bad_id] = copy
        for obj in objects:
            obj.copy_title = copy.title
            obj.archive_copy_id = copy.archive_copy_id
            obj.copy_institution = copy.institution
            obj.copy_composition_date = copy.composition_date
            obj.copy_bad_id = copy.bad_id
        print "added copy"


def main():
    from sqlalchemy.orm import sessionmaker

    parser = argparse.ArgumentParser()
    parser.add_argument("document_filename")
    args = parser.parse_args()
    matching_files = glob.glob(args.document_filename)
    importer = BlakeDocumentImporter()
    for matching_file in matching_files:
        try:
            importer.process(matching_file)
        except ValueError as err:
            print err
    importer.process_relationships()
    importer.process_motif_relationships()
    importer.populate_works()
    engine = models.db.create_engine(config.db_connection_string)
    session = sessionmaker(bind=engine)()
    models.BlakeObject.metadata.drop_all(bind=engine)
    models.BlakeObject.metadata.create_all(bind=engine)
    session.add_all(importer.works)
    session.add_all(importer.objects.values())
    session.commit()


if __name__ == "__main__":
    main()
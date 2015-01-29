__author__ = 'nathan'

import argparse
import glob
import os
import json
import tablib
import re
from lxml import etree

import xmltodict

import models
import config


class BlakeDocumentImporter(object):
    def __init__(self):
        self.works = {}
        self.copies = []
        self.objects = {}
        self.relationships = tablib.Dataset()
        with open("static/csv/blake-relations.csv") as f:
            self.relationships.csv = f.read()

    def process_relationships(self):
        for relationship in self.relationships:
            obj = self.objects.get(relationship[0])
            same_matrix = []
            same_production_sequence = []
            for desc_id in relationship[4].split(","):
                if self.objects.get(desc_id):
                    same_matrix.append(self.objects.get(desc_id))
            for desc_id in relationship[5].split(","):
                if self.objects.get(desc_id):
                    same_production_sequence.append(self.objects.get(desc_id))
            obj.objects_from_same_matrix.extend(same_matrix)
            obj.objects_from_same_production_sequence.extend(same_production_sequence)

    def process_object(self, obj):

        def element_to_dict(o):
            return xmltodict.parse(etree.tostring(o, encoding='utf8', method='xml'))

        def elements_to_json(elements):
            return [element_to_dict(o) for o in elements]

        bo = models.BlakeObject()

        bo.desc_id = obj.attrib.get("id")
        self.objects[bo.desc_id] = bo
        # We need to pull out the illusdesc and store it separately
        for illustration_description in obj.xpath("illusdesc"):
            characteristics = illustration_description.xpath("illustration/component/characteristic")
            bo.characteristics = elements_to_json(characteristics)
            for desc in illustration_description.xpath("illustration/illusobjdesc"):
                bo.illustration_description = element_to_dict(desc)
                break
            break
        for phystext in obj.xpath("phystext"):
            bo.text = element_to_dict(phystext)["phystext"]
            break
        for objcode in obj.xpath("objtitle/objid/objcode"):
            obj_id = objcode.get("code").upper()
            if obj_id.startswith("B"):
                bo.bentley_id = obj_id
                break
        for title in obj.xpath("objtitle/title"):
            bo.title = title.xpath("string()").encode("utf-8")
            break
        bo.notes = " ".join(n.xpath("string()").encode("utf-8") for n in obj.xpath("//note") + obj.xpath("//objnote"))
        return bo

    def process(self, document):
        if os.path.isfile(document):
            root = etree.parse(document).getroot()
        else:
            root = etree.fromstring(document).getroot()
        if not root.tag == "bad":
            raise ValueError("Document is not a blake archive xml document")
        (work_id, copy_id) = root.get("id").split(".")
        for comp_date in root.xpath("//compdate"):
            comp_date_string = comp_date.xpath("text()")[0]
            comp_date = re.match("\D*(\d{4})", comp_date_string).group(1)
            break
        if work_id not in self.works:
            self.works[work_id] = models.BlakeWork(bad_id=work_id, title=root.get("work"),
                                                   medium=root.get("type"), composition_date=comp_date,
                                                   composition_date_string=comp_date_string)
        header_json = json.dumps(
            xmltodict.parse(etree.tostring(root.xpath("header")[0], encoding='utf8', method='xml'))["header"])
        source_json = json.dumps(
            xmltodict.parse(etree.tostring(root.xpath("objdesc/source")[0], encoding='utf8', method='xml'))["source"])
        objects = [self.process_object(o) for o in root.xpath("objdesc/desc")]
        copy = models.BlakeCopy(bad_id=copy_id, header=header_json, source=source_json, objects=objects,
                                composition_date=comp_date, composition_date_string=comp_date_string)
        for title in root.xpath("header/filedesc/titlestmt/title"):
            copy.title = title.xpath("string()").encode("utf-8")
            break
        for institution in root.xpath("//institution"):
            copy.institution = institution.xpath("text()")
            break
        copy.medium = root.get("type").encode("utf-8")
        self.copies.append(copy)
        self.works[work_id].copies.append(copy)
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
    engine = models.db.create_engine(config.db_connection_string)
    session = sessionmaker(bind=engine)()
    models.BlakeObject.metadata.drop_all(bind=engine)
    models.BlakeObject.metadata.create_all(bind=engine)
    session.add_all(importer.works.values())
    session.add_all(importer.objects.values())
    session.commit()


if __name__ == "__main__":
    main()
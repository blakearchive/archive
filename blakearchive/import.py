import argparse
import glob
import os
import os.path
import json
import tablib
import re
from collections import defaultdict
import itertools
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
        self.work_info_map = {}
        self.virtual_works = defaultdict(lambda: set())
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
        with open("static/csv/works.csv") as f:
            self.works_dataset.csv = f.read()
            for (work_id, bads) in zip(self.works_dataset["bad_id"], self.works_dataset["virtual objects"]):
                self.virtual_works[work_id].update(re.split(r",\s*", bads))
        for (copy_bad_id, dbi) in self.copy_handprints:
            self.copy_handprint_map[copy_bad_id] = dbi.lower()
        for (desc_id, matching_ids, in_archive) in self.motif_relationships:
            desc_id = desc_id.lower()
            matching_ids = matching_ids.lower()
            matching_ids_set = set(matching_ids.split(",") + [desc_id])
            for matching_id in matching_ids_set:
                all_but_current_id = matching_ids_set ^ set([matching_id])
                self.motif_relationships_expanded[matching_id].update(all_but_current_id)
        xslt_xml = etree.parse(open("static/xslt/transcription.xsl"))

        # We need to define a custom token fuction here to replace the functionality provided by xalan
        def custom_tokenize(context, string, split_token):
            if type(string) is list:
                string = string[0]
            return string.split(split_token)

        ns = etree.FunctionNamespace(None)
        ns['custom_tokenize'] = custom_tokenize

        self.transform = etree.XSLT(xslt_xml)

    def process_info_file(self, document):
        def transform_relationship(rel):
            rel_text = rel.xpath("text()")
            link = rel.xpath("link")
            if link:
                title = {
                    "text": link[0].xpath("string()").encode("utf-8"),
                    "link": link[0].attrib["ptr"].encode("utf-8"),
                    "type": link[0].attrib["type"].encode("utf-8")
                }
            else:
                title = {"text": "".join(i.xpath("string()").encode("utf-8").strip() for i in rel.xpath("i"))}
            result = {"title": title, "info": "<br />".join(rt.encode("utf-8").strip() for rt in rel_text)}
            return result

        root = etree.parse(document).getroot()
        document_name = os.path.split(document)[1]
        self.work_info_map[document_name] = [transform_relationship(r) for r in root.xpath("./related/relationship")]

    def populate_works(self):
        for (title, medium, composition_date_string, cover_image, copies, bad_id, info, info_filename, virtual,
             virtual_objects) in self.works_dataset:
            if not bad_id:
                bad_id = info_filename.split(".", 1)[0]
            composition_date = int(re.search(r"(\d{4})", composition_date_string).group(1))
            work = models.BlakeWork(title=title.encode('utf-8'), medium=medium,
                                    bad_id=bad_id, virtual=bool(virtual),
                                    composition_date=composition_date,
                                    composition_date_string=composition_date_string.encode('utf-8'),
                                    image=cover_image.encode('utf-8'),
                                    info=info.encode('utf-8'))
            if info_filename in self.work_info_map:
                work.related_works = self.work_info_map[info_filename]
            else:
                print "info file does not exist: %s" % info_filename
            self.works.append(work)
            if int(virtual) == 1:
                # Virtual works need to have a special copy created just for them
                objects = list(itertools.chain.from_iterable(
                    self.copies[copy_id].objects for copy_id in virtual_objects.split(",")))
                virtual_work_copy = models.BlakeCopy(work_id=bad_id, title=title.encode('utf-8'), image=cover_image,
                                                     bad_id=bad_id, archive_copy_id=bad_id,
                                                     composition_date=composition_date,
                                                     composition_date_string=composition_date_string)
                # We need to clean-up since we're not using the previously generated copy, but the new virtual copy
                for obj in objects:
                    old_copy = obj.copy
                    obj.header = old_copy.header
                    obj.source = old_copy.source
                    obj.copy = virtual_work_copy
                    if old_copy.bad_id in self.copies:
                        del self.copies[old_copy.bad_id]
                work.copies.append(virtual_work_copy)
                self.copies[bad_id] = virtual_work_copy
            else:
                for copy in copies.split(","):
                    if copy in self.copies:
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
        bo.notes = [note.xpath("string()") for note in obj.xpath(".//note") + obj.xpath(".//objnote")]
        for title in obj.xpath(".//title"):
            bo.title = title.xpath("string()")
        if not getattr(bo, "title"):
            for objnumber in obj.xpath(".//objnumber"):
                if objnumber.attrib.get("code") == "A1":
                    bo.title = objnumber.xpath("text()")
                    break
        for phystext in obj.xpath("phystext"):
            bo.text = element_to_dict(phystext)["phystext"]
            bo.markup_text = etree.tostring(self.transform(phystext))
            # print etree.tostring(phystext, pretty_print=True)
            break
        for objid in obj.xpath("objtitle/objid"):
            bo.full_object_id = objid.xpath("string()").encode("utf-8")
            break
        for objnumber in obj.xpath("objtitle/objid/objnumber"):
            obj_number = objnumber.get("code").encode("utf-8").upper()
            obj_number_value = re.search(r'\d+', obj_number)
            if obj_number_value:
                bo.object_number = int(obj_number_value.group(0))
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
        return bo

    def process(self, document):
        if os.path.isfile(document):
            root = etree.parse(document).getroot()
        else:
            root = etree.fromstring(document).getroot()
        if not root.tag == "bad":
            raise ValueError("Document is not a blake archive xml document")
        copy_id = root.get("id").lower()
        for cd in root.xpath("//compdate"):
            comp_date_string = cd.xpath("string()").encode("utf-8")
            comp_date = int(re.match("\D*(\d{4})", comp_date_string).group(1))
            break
        print_date = None
        print_date_string = None
        for pd in root.xpath("//printdate"):
            print_date_string = pd.attrib["value"]
            print_date_match = re.match("\D*(\d{4})", print_date_string)
            if print_date_match:
                print_date = int(print_date_match.group(1))
            break
        archive_copy_id = root.get("copy")
        header_xml = etree.tostring(root.xpath("header")[0], encoding='utf8', method='xml')
        header_json = json.dumps(xmltodict.parse(header_xml, force_cdata=True)["header"])
        source_xml = etree.tostring(root.xpath("objdesc/source")[0], encoding='utf8', method='xml')
        source_json = json.dumps(xmltodict.parse(source_xml, force_cdata=True)["source"])
        objects = [self.process_object(o) for o in root.xpath("objdesc/desc")]
        copy = models.BlakeCopy(bad_id=copy_id, header=header_json, source=source_json, objects=objects,
                                composition_date=comp_date, composition_date_string=comp_date_string,
                                print_date=print_date, print_date_string=print_date_string,
                                archive_copy_id=archive_copy_id)
        if copy_id in self.copy_handprint_map:
            copy.image = self.copy_handprint_map[copy_id]
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
        print "added copy"

    def denormalize_objects(self):
        for obj in self.objects.values():
            obj.copy_title = obj.copy.title
            obj.archive_copy_id = obj.copy.archive_copy_id
            obj.copy_institution = obj.copy.institution
            obj.copy_composition_date = obj.copy.composition_date
            obj.copy_bad_id = obj.copy.bad_id


def main():
    from sqlalchemy.orm import sessionmaker

    parser = argparse.ArgumentParser()
    parser.add_argument("document_filename")
    parser.add_argument("info_filename")
    args = parser.parse_args()
    matching_bad_files = glob.glob(args.document_filename)
    matching_info_files = glob.glob(args.info_filename)
    importer = BlakeDocumentImporter()
    for matching_info_file in matching_info_files:
        try:
            importer.process_info_file(matching_info_file)
        except ValueError as err:
            print err
    for matching_file in matching_bad_files:
        try:
            importer.process(matching_file)
        except ValueError as err:
            print err
    importer.process_relationships()
    importer.process_motif_relationships()
    importer.populate_works()
    importer.denormalize_objects()
    engine = models.db.create_engine(config.db_connection_string)
    session = sessionmaker(bind=engine)()
    models.BlakeObject.metadata.drop_all(bind=engine)
    models.BlakeObject.metadata.create_all(bind=engine)
    session.add_all(importer.works)
    session.add_all(importer.objects.values())
    session.commit()


if __name__ == "__main__":
    main()

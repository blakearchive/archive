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
                    self.copies[copy_id].objects for copy_id in virtual_objects.split(",") if copy_id in self.copies))
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
                    obj.object_group = old_copy.title
                    old_copy.effective_copy_id = virtual_work_copy.bad_id
                work.copies.append(virtual_work_copy)
                self.copies[bad_id] = virtual_work_copy
            else:
                for copy in copies.split(","):
                    if copy in self.copies:
                        work.copies.append(self.copies[copy])

    def get_matching_objects(self, desc_ids):
        return [self.objects[desc_id] for desc_id in desc_ids if desc_id in self.objects]

    def get_matching_copies(self, bad_ids):
        return [self.copies[bad_id] for bad_id in bad_ids if bad_id in self.copies]

    def get_matching_works(self, bad_ids):
        return [self.works[bad_id] for bad_id in bad_ids if bad_id in self.works]

    def split_ids(self, id_string):
        return id_string.lower().split(",")

    def process_relationships(self):
        for (desc_id, dbi, bad_id, vg, same_matrix, same_production_sequence, similar_design, referenced_objects,
             referenced_copies, referenced_works, supplemental) in self.relationships:
            obj = self.objects.get(desc_id.lower())

            same_matrix_ids = self.split_ids(same_matrix)
            same_matrix_objects = self.get_matching_objects(same_matrix_ids)
            obj.objects_from_same_matrix.extend(same_matrix_objects)

            same_production_sequence_ids = self.split_ids(same_production_sequence)
            same_production_sequence_objects = self.get_matching_objects(same_production_sequence_ids)
            obj.objects_from_same_production_sequence.extend(same_production_sequence_objects)

            same_motif_ids = self.split_ids(similar_design)
            same_motif_objects = self.get_matching_objects(same_motif_ids)
            obj.objects_with_same_motif.extend(same_motif_objects)

            referenced_object_ids = self.split_ids(referenced_objects)
            referenced_objects = self.get_matching_objects(referenced_object_ids)
            obj.textually_referenced_objects.extend(referenced_objects)

            referenced_copy_ids = self.split_ids(referenced_copies)
            referenced_copies = self.get_matching_copies(referenced_copy_ids)
            obj.textually_referenced_copies.extend(referenced_copies)

            referenced_work_ids = self.split_ids(referenced_works)
            referenced_works = self.get_matching_copies(referenced_work_ids)
            obj.textually_referenced_works.extend(referenced_works)

    def get_object_title(self, obj):
        for title in obj.xpath("objtitle/title"):
            return title.xpath("string()").encode("utf-8")
        else:
            for objnumber in obj.xpath(".//objnumber"):
                if objnumber.attrib.get("code") == "A1":
                    return objnumber.xpath("string()").encode("utf-8")

    def element_to_dict(self, obj):
            element_xml = etree.tostring(obj, encoding='utf8', method='xml')
            return xmltodict.parse(element_xml, force_cdata=True)

    def get_text(self, obj):
        for phystext in obj.xpath("phystext"):
            return self.element_to_dict(phystext)["phystext"]

    def get_markuptext(self, obj):
        for phystext in obj.xpath("phystext"):
            return etree.tostring(self.transform(phystext))

    def get_components(self, obj):
        components = obj.xpath(".//illusdesc/illustration/component")
        return [self.element_to_dict(c) for c in components]

    def get_illustration_description(self, obj):
        for description in obj.xpath("illusdesc/illustration/illusobjdesc"):
            return self.element_to_dict(description)

    def get_full_object_id(self, obj):
        for objid in obj.xpath("objtitle/objid"):
            return objid.xpath("string()").encode("utf-8")

    def get_object_number(self, obj):
        for objnumber in obj.xpath("objtitle/objid/objnumber"):
            obj_number = objnumber.get("code").encode("utf-8").upper()
            obj_number_value = re.search(r'\d+', obj_number)
            if obj_number_value:
                return int(obj_number_value.group(0))

    def get_bentley_id(self, obj):
        for objcode in obj.xpath("objtitle/objid/objcode"):
            obj_id = objcode.get("code").encode("utf-8").upper()
            if obj_id.startswith("B"):
                bentley_id = re.search(r'\d+', obj_id)
                if bentley_id:
                    return int(bentley_id.group(0))

    def get_object_notes(self, obj):
        return [note.xpath("string()") for note in obj.xpath(".//note") + obj.xpath(".//objnote")]

    def get_physical_description(self, obj):
        for physdesc in obj.xpath("physdesc"):
            return self.element_to_dict(physdesc)["physdesc"]

    def process_object(self, obj):
        bo = models.BlakeObject()
        bo.desc_id = obj.attrib.get("id").lower()
        bo.dbi = obj.attrib.get("dbi").lower()

        self.objects[bo.desc_id] = bo
        bo.components = self.get_components(obj)
        bo.illustration_description = self.get_illustration_description(obj)
        bo.notes = self.get_object_notes(obj)
        bo.title = self.get_object_title(obj)
        bo.text = self.get_text(obj)
        bo.markup_text = self.get_markuptext(obj)
        bo.full_object_id = self.get_full_object_id(obj)
        bo.object_number = self.get_object_number(obj)
        bo.bentley_id = self.get_bentley_id(obj)
        bo.physical_description = self.get_physical_description(obj)
        return bo

    def extract_date(self, date_string):
        if date_string:
            date_match = re.match("\D*(\d{4})", date_string)
            if date_match:
                return int(date_match.group(1))

    def get_compdate_string(self, document):
        for cd in document.xpath("//compdate"):
            return cd.xpath("string()").encode("utf-8")

    def get_printdate_string(self, document):
        for pd in document.xpath("//printdate"):
            return pd.attrib["value"]

    def get_header(self, document):
        for header in document.xpath("header"):
            header_xml = etree.tostring(header, encoding='utf8', method='xml')
            return json.dumps(xmltodict.parse(header_xml, force_cdata=True)["header"])

    def get_source(self, document):
        for source in document.xpath("objdesc/source"):
            source_xml = etree.tostring(source, encoding='utf8', method='xml')
            return json.dumps(xmltodict.parse(source_xml, force_cdata=True)["source"])

    def get_copy_title(self, document):
        for title in document.xpath("header/filedesc/titlestmt/title"):
            title_text = title.xpath("string()")
            return re.match(r"(?:(.*):|(.*))", title_text, flags=re.DOTALL).group(1).encode("utf-8")

    def get_copy_institution(self, document):
        for institution in document.xpath("//institution"):
            return institution.xpath("string()").encode("utf-8")

    def get_document_tree(self, document):
        if os.path.isfile(document):
            root = etree.parse(document).getroot()
        else:
            root = etree.fromstring(document).getroot()
        if not root.tag == "bad":
            raise ValueError("Document is not a blake archive xml document")
        return root

    def process(self, document):
        root = self.get_document_tree(document)
        copy_id = root.get("id").lower()
        comp_date_string = self.get_compdate_string(root)
        comp_date = self.extract_date(comp_date_string)
        print_date_string = self.get_printdate_string(root)
        print_date = self.extract_date(print_date_string)
        archive_copy_id = root.get("copy")
        header = self.get_header(root)
        source = self.get_source(root)
        objects = [self.process_object(o) for o in root.xpath("objdesc/desc")]
        copy = models.BlakeCopy(bad_id=copy_id, header=header, source=source, objects=objects,
                                composition_date=comp_date, composition_date_string=comp_date_string,
                                print_date=print_date, print_date_string=print_date_string,
                                archive_copy_id=archive_copy_id, image=self.copy_handprint_map.get(copy_id))
        copy.effective_copy_id = copy_id
        copy.title = self.get_copy_title(root)
        copy.institution = self.get_copy_institution(root)
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

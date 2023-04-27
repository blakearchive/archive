from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.sql import case

db = SQLAlchemy()

motif__object = db.Table(
    "motif__object",
    db.Model.metadata,
    db.Column("motif__object_id", db.Integer, primary_key=True),
    db.Column("object_id", db.Integer, db.ForeignKey("object.object_id")),
    db.Column("related_object_id", db.Integer, db.ForeignKey("object.object_id"))
)

matrix__object = db.Table(
    "matrix__object",
    db.Model.metadata,
    db.Column("matrix__object_id", db.Integer, primary_key=True),
    db.Column("object_id", db.Integer, db.ForeignKey("object.object_id")),
    db.Column("related_object_id", db.Integer, db.ForeignKey("object.object_id"))
)

production_sequence__object = db.Table(
    "production_sequence__object",
    db.Model.metadata,
    db.Column("production_sequence__object_id", db.Integer, primary_key=True),
    db.Column("object_id", db.Integer, db.ForeignKey("object.object_id")),
    db.Column("related_object_id", db.Integer, db.ForeignKey("object.object_id"))
)

textual_reference__object = db.Table(
    "textual_reference__object",
    db.Model.metadata,
    db.Column("textual_reference__object_id", db.Integer, primary_key=True),
    db.Column("object_id", db.Integer, db.ForeignKey("object.object_id")),
    db.Column("related_object_id", db.Integer, db.ForeignKey("object.object_id"))
)

textual_reference__copy = db.Table(
    "textual_reference__copy",
    db.Model.metadata,
    db.Column("textual_reference__copy_id", db.Integer, primary_key=True),
    db.Column("object_id", db.Integer, db.ForeignKey("object.object_id")),
    db.Column("related_copy_id", db.Integer, db.ForeignKey("copy.copy_id"))
)

textual_reference__work = db.Table(
    "textual_reference__work",
    db.Model.metadata,
    db.Column("textual_reference__work_id", db.Integer, primary_key=True),
    db.Column("object_id", db.Integer, db.ForeignKey("object.object_id")),
    db.Column("related_work_id", db.Integer, db.ForeignKey("work.work_id"))
)

text_match__object = db.Table(
    "text_match__object",
    db.Model.metadata,
    db.Column("text_match__object_id", db.Integer, primary_key=True),
    db.Column("object_id", db.Integer, db.ForeignKey("object.object_id")),
    db.Column("related_object_id", db.Integer, db.ForeignKey("object.object_id"))
)


class BlakeFragmentPair(db.Model):
    __tablename__ = "fragmentpair"
    fragmentpair_id = db.Column(db.Integer, primary_key=True)
    fragment = db.Column(db.UnicodeText)
    desc_id1 = db.Column(db.UnicodeText, index=True)
    desc_id2 = db.Column(db.UnicodeText, index=True)

    @property
    def to_dict(self):
        return {
            "fragment": self.fragment,
            "desc_id1": self.desc_id1,
            "desc_id2": self.desc_id2,
        }


class BlakeObject(db.Model):
    __tablename__ = "object"
    object_id = db.Column(db.Integer, primary_key=True)
    copy_id = db.Column(db.Integer, db.ForeignKey("copy.copy_id"))
    desc_id = db.Column(db.UnicodeText, index=True)
    butnumber = db.Column(db.UnicodeText, index=True)
    dbi = db.Column(db.UnicodeText, index=True)
    bentley_id = db.Column(db.Integer, index=True)
    object_number = db.Column(db.Integer, index=True)
    full_object_id = db.Column(db.UnicodeText)
    copy_title = db.Column(db.UnicodeText)
    virtualwork_title = db.Column(db.UnicodeText)
    archive_copy_id = db.Column(db.Text)
    archive_set_id = db.Column(db.Text)
    virtualwork_id = db.Column(db.Text)
    copy_institution = db.Column(db.Text)
    copy_composition_date = db.Column(db.Integer)
    copy_composition_date_value = db.Column(db.UnicodeText)
    copy_composition_date_string = db.Column(db.UnicodeText)
    copy_print_date = db.Column(db.Integer)
    copy_print_date_value = db.Column(db.UnicodeText)
    copy_print_date_string = db.Column(db.UnicodeText)
    copy_bad_id = db.Column(db.Text)
    characteristics = db.Column(db.UnicodeText)
    illustration_description = db.Column(JSON)
    components = db.Column(JSON)
    text = db.Column(JSON)
    markup_text = db.Column(db.UnicodeText)
    physical_description = db.Column(JSON)
    title = db.Column(db.UnicodeText)
    header = db.Column(JSON)
    source = db.Column(JSON)
    notes = db.Column(JSON)
    object_note_images = db.Column(JSON)
    object_group = db.Column(db.UnicodeText)
    supplemental = db.Column(db.UnicodeText)
    fragment = db.Column(db.UnicodeText)
    is_object_for_work_in_preview = db.Column(db.Boolean)
    work_bad_id = db.Column(db.Text)

    objects_from_same_matrix = db.relationship(
        "BlakeObject",
        order_by="BlakeObject.ordering_date",
        secondary=matrix__object,
        primaryjoin=object_id == matrix__object.c.object_id,
        secondaryjoin=object_id == matrix__object.c.related_object_id,
        remote_side=matrix__object.c.related_object_id)
    objects_from_same_production_sequence = db.relationship(
        "BlakeObject",
        order_by="BlakeObject.ordering_date",
        secondary=production_sequence__object,
        primaryjoin=object_id == production_sequence__object.c.object_id,
        secondaryjoin=object_id == production_sequence__object.c.related_object_id,
        remote_side=production_sequence__object.c.related_object_id,
    )
    objects_with_text_matches = db.relationship(
        "BlakeObject",
        order_by="BlakeObject.ordering_date",
        secondary=text_match__object,
        primaryjoin=object_id == text_match__object.c.object_id,
        secondaryjoin=object_id == text_match__object.c.related_object_id,
        remote_side=text_match__object.c.related_object_id,
    )

    objects_with_same_motif = db.relationship(
        "BlakeObject",
        order_by="BlakeObject.ordering_date",
        secondary=motif__object,
        primaryjoin=object_id == motif__object.c.object_id,
        secondaryjoin=object_id == motif__object.c.related_object_id,
        remote_side=motif__object.c.related_object_id)
    textually_referenced_objects = db.relationship(
        "BlakeObject",
        order_by="BlakeObject.ordering_date",
        secondary=textual_reference__object,
        primaryjoin=object_id == textual_reference__object.c.object_id,
        secondaryjoin=object_id == textual_reference__object.c.related_object_id,
        remote_side=motif__object.c.related_object_id)
    textually_referenced_copies = db.relationship("BlakeCopy", secondary=textual_reference__copy)
    textually_referenced_works = db.relationship("BlakeWork", secondary=textual_reference__work)

    @hybrid_property
    def ordering_date(self):
        return self.copy_print_date_value or self.copy_composition_date_value

    @ordering_date.expression
    def ordering_date(cls):
        return case([
            (cls.copy_print_date_value != None, cls.copy_print_date_value)
        ], else_=cls.copy_composition_date_value)

    def __init__(self, *args, **kwargs):
        super(BlakeObject, self).__init__(*args, **kwargs)

    @property
    def to_dict(self):
        return {
            "bentley_id": self.bentley_id,
            "object_number": self.object_number,
            "object_id": self.object_id,
            "desc_id": self.desc_id,
            "butnumber": self.butnumber,
            "dbi": self.dbi,
            "copy_id": self.copy_id,
            "copy_title": self.copy_title,
            "virtualwork_title": self.virtualwork_title,
            "virtualwork_id": self.virtualwork_id,
            "archive_copy_id": self.archive_copy_id,
            "archive_set_id": self.archive_set_id,
            "copy_institution": self.copy_institution,
            "copy_composition_date": self.copy_composition_date,
            "copy_composition_date_string": self.copy_composition_date_string,
            "copy_composition_date_value": self.copy_composition_date_value,
            "copy_print_date": self.copy_print_date,
            "copy_print_date_string": self.copy_print_date_string,
            "copy_print_date_value": self.copy_print_date_value,
            "characteristics": self.characteristics,
            "ordering_date": self.ordering_date,
            "copy_bad_id": self.copy_bad_id,
            "full_object_id": self.full_object_id,
            "illustration_description": self.illustration_description,
            "components": self.components,
            "text": self.text,
            "markup_text": self.markup_text,
            "physical_description": self.physical_description,
            "title": self.title,
            "header": self.header,
            "source": self.source,
            "supplemental": self.supplemental,
            "notes": self.notes,
            "object_note_images": self.object_note_images,
            "object_group": self.object_group,
            "fragment": self.fragment,
            "is_object_for_work_in_preview": self.is_object_for_work_in_preview,
            "work_bad_id": self.work_bad_id
        }


class BlakeCopy(db.Model):
    __tablename__ = "copy"
    copy_id = db.Column(db.Integer, primary_key=True)
    work_id = db.Column(db.Integer, db.ForeignKey("work.work_id"))
    bad_id = db.Column(db.UnicodeText, index=True)
    archive_copy_id = db.Column(db.Text)
    archive_set_id = db.Column(db.Text)
    header = db.Column(JSON)
    source = db.Column(JSON)
    header_html = db.Column(db.Text)
    title = db.Column(db.UnicodeText)
    objects = db.relationship(BlakeObject, backref="copy")
    institution = db.Column(db.UnicodeText)
    image = db.Column(db.UnicodeText)
    composition_date = db.Column(db.Integer)
    composition_date_string = db.Column(db.UnicodeText)
    composition_date_value = db.Column(db.UnicodeText)
    print_date = db.Column(db.Integer)
    print_date_string = db.Column(db.UnicodeText)
    print_date_value = db.Column(db.UnicodeText)
    effective_copy_id = db.Column(db.UnicodeText, index=True)
    number_of_objects = db.Column(db.Integer)
    is_copy_for_work_in_preview = db.Column(db.Boolean)

    # bad_xml = db.Column(db.Text)

    def __init__(self, *args, **kwargs):
        super(BlakeCopy, self).__init__(*args, **kwargs)

    @property
    def to_dict(self):
        return {
            "copy_id": self.copy_id,
            "archive_copy_id": self.archive_copy_id,
            "archive_set_id": self.archive_set_id,
            "work_id": self.work_id,
            "bad_id": self.bad_id,
            "source": self.source,
            "title": self.title,
            "institution": self.institution,
            "image": self.image,
            "header": self.header,
            "header_html": self.header_html,
            "composition_date": self.composition_date,
            "composition_date_string": self.composition_date_string,
            "print_date_string": self.print_date_string,
            "print_date": self.print_date,
            "effective_copy_id": self.effective_copy_id,
            "number_of_objects": self.number_of_objects,
            "is_copy_for_work_in_preview": self.is_copy_for_work_in_preview
        }


class BlakeWork(db.Model):
    __tablename__ = "work"
    work_id = db.Column(db.Integer, primary_key=True)
    bad_id = db.Column(db.Text, index=True)
    title = db.Column(db.UnicodeText)
    medium = db.Column(db.UnicodeText)
    copies = db.relationship(BlakeCopy, backref="work")
    info = db.Column(db.UnicodeText)
    image = db.Column(db.UnicodeText)
    composition_date = db.Column(db.Integer)
    composition_date_string = db.Column(db.UnicodeText)
    composition_date_value = db.Column(db.UnicodeText)
    related_works = db.Column(JSON)
    virtual = db.Column(db.Boolean)
    preview = db.Column(db.Boolean)
    preview_copies = db.Column(db.UnicodeText)

    @property
    def to_dict(self):
        return {
            "work_id": self.work_id,
            "bad_id": self.bad_id,
            "title": self.title,
            "medium": self.medium,
            "info": self.info,
            "image": self.image,
            "composition_date": self.composition_date,
            "composition_date_string": self.composition_date_string,
            "composition_date_value": self.composition_date_value,
            "related_works": self.related_works,
            "virtual": self.virtual,
            "preview": self.preview,
            "preview_copies": self.preview_copies
        }


class BlakeFeaturedWork(db.Model):
    __tablename__ = "featured_work"
    featured_work_id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.UnicodeText)
    byline = db.Column(db.UnicodeText)
    desc_id = db.Column(db.UnicodeText)
    dbi = db.Column(db.UnicodeText)
    bad_id = db.Column(db.Text)

    @property
    def to_dict(self):
        return {
            "title": self.title,
            "byline": self.byline,
            "dbi": self.dbi,
            "desc_id": self.desc_id,
            "bad_id": self.bad_id
        }


class BlakeExhibitCaption(db.Model):
    __tablename__ = "exhibit_caption"
    exhibit_caption_id = db.Column(db.Text, primary_key=True)
    caption = db.Column(db.Text)
    image_id = db.Column(db.Integer, index=True)
    exhibit_id = db.Column(db.Text, index=True)
    image_pk = db.Column(db.Integer, db.ForeignKey("exhibit_image.exhibit_image_pk"))
    title = db.Column(db.UnicodeText)

    @property
    def to_dict(self):
        return {
            "exhibit_id": self.exhibit_id,
            "caption": self.caption,
            "image_id": self.image_id,
            "title": self.title
        }


class BlakeExhibitImage(db.Model):  # todo: change to correct columns name, image, etc
    __tablename__ = "exhibit_image"
    exhibit_image_pk = db.Column(db.Integer, primary_key=True)
    image_id = db.Column(db.Integer, index=True)
    exhibit_id = db.Column(db.Text, index=True)
    exhibit_pk = db.Column(db.Integer, db.ForeignKey("exhibit.exhibit_pk"))
    # caption = db.Column(db.UnicodeText)
    dbi = db.Column(db.UnicodeText)
    title = db.Column(db.Text)
    # bad_id = db.Column(db.Text)
    captions = db.relationship(BlakeExhibitCaption, backref="exhibit_image")

    @property
    def to_dict(self):
        return {
            # "caption": self.caption,
            "dbi": self.dbi,
            "exhibit_id": self.exhibit_id,
            "title": self.title,
            "image_id": self.image_id
        }


# Represents an Exhibit. A presentation that has text passages on the left side
# with links to images in a horizontal 'slideshow' on the right.
class BlakeExhibit(db.Model):  # todo: change to correct columns name, image, etc
    __tablename__ = "exhibit"
    exhibit_pk = db.Column(db.Integer, primary_key=True)
    exhibit_id = db.Column(db.Text, index=True)
    title = db.Column(db.UnicodeText)
    article = db.Column(db.UnicodeText)
    exhibit_images = db.relationship(BlakeExhibitImage, backref="exhibit")
    composition_date_string = db.Column(db.UnicodeText)

    # bad_id = db.Column(db.Text)

    @property
    def to_dict(self):
        #        image_json = "["
        #        for x in self.exhibit_images:
        #            #print x.__dict__
        #            image_json += str(x.__dict__)
        #        image_json += "]"
        #        print image_json

        return {
            "title": self.title,
            "article": self.article,
            "exhibit_id": self.exhibit_id,
            "composition_date_string": self.composition_date_string
        }


class BlakePreviewImage(db.Model):  # todo: change to correct columns name, image, etc
    __tablename__ = "preview_image"
    preview_image_pk = db.Column(db.Integer, primary_key=True)
    image_id = db.Column(db.Integer, index=True)
    preview_id = db.Column(db.Text, index=True)
    preview_pk = db.Column(db.Integer, db.ForeignKey("preview.preview_pk"))
    # caption = db.Column(db.UnicodeText)
    dbi = db.Column(db.UnicodeText)

    @property
    def to_dict(self):
        return {
            # "caption": self.caption,
            "dbi": self.dbi,
            "preview_id": self.preview_id,
            "image_id": self.image_id
        }


# Represents an Exhibit. A presentation that has text passages on the left side
# with links to images in a horizontal 'slideshow' on the right.
class BlakePreview(db.Model):  # todo: change to correct columns name, image, etc
    __tablename__ = "preview"
    preview_pk = db.Column(db.Integer, primary_key=True)
    preview_id = db.Column(db.Text, index=True)
    title = db.Column(db.UnicodeText)
    preview_images = db.relationship(BlakePreviewImage, backref="preview")
    composition_date_string = db.Column(db.UnicodeText)
    source = db.Column(JSON)

    # bad_id = db.Column(db.Text)

    @property
    def to_dict(self):
        #        image_json = "["
        #        for x in self.exhibit_images:
        #            #print x.__dict__
        #            image_json += str(x.__dict__)
        #        image_json += "]"
        #        print image_json

        return {
            "title": self.title,
            "preview_id": self.preview_id,
            "composition_date_string": self.composition_date_string,
            "source": self.source
        }

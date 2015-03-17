from flask.ext.sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import JSON


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


class BlakeObject(db.Model):
    __tablename__ = "object"
    object_id = db.Column(db.Integer, primary_key=True)
    copy_id = db.Column(db.Integer, db.ForeignKey("copy.copy_id"))
    desc_id = db.Column(db.UnicodeText, index=True)
    dbi = db.Column(db.UnicodeText, index=True)
    bentley_id = db.Column(db.UnicodeText, index=True)
    full_object_id = db.Column(db.UnicodeText)
    illustration_description = db.Column(JSON)
    components = db.Column(JSON)
    text = db.Column(JSON)
    physical_description = db.Column(JSON)
    title = db.Column(db.UnicodeText)
    objects_from_same_matrix = db.relationship(
        "BlakeObject",
        secondary=matrix__object,
        primaryjoin=object_id == matrix__object.c.object_id,
        secondaryjoin=object_id == matrix__object.c.related_object_id,
        remote_side=matrix__object.c.related_object_id)
    objects_from_same_production_sequence = db.relationship(
        "BlakeObject",
        secondary=production_sequence__object,
        primaryjoin=object_id == production_sequence__object.c.object_id,
        secondaryjoin=object_id == production_sequence__object.c.related_object_id,
        remote_side=production_sequence__object.c.related_object_id)

    def __init__(self, *args, **kwargs):
        super(BlakeObject, self).__init__(*args, **kwargs)

    @property
    def to_dict(self):
        return {
            "bentley_id": self.bentley_id,
            "object_id": self.object_id,
            "desc_id": self.desc_id,
            "dbi": self.dbi,
            "copy_id": self.copy_id,
            "full_object_id": self.full_object_id,
            "illustration_description": self.illustration_description,
            "components": self.components,
            "text": self.text,
            "physical_description": self.physical_description,
            "title": self.title
        }


class BlakeCopy(db.Model):
    __tablename__ = "copy"
    copy_id = db.Column(db.Integer, primary_key=True)
    work_id = db.Column(db.Integer, db.ForeignKey("work.work_id"))
    bad_id = db.Column(db.UnicodeText, index=True)
    header = db.Column(JSON)
    source = db.Column(JSON)
    title = db.Column(db.UnicodeText)
    objects = db.relationship(BlakeObject, backref="copy")
    institution = db.Column(db.UnicodeText)
    image = db.Column(db.UnicodeText)
    composition_date = db.Column(db.Integer)
    composition_date_string = db.Column(db.UnicodeText)

    def __init__(self, *args, **kwargs):
        super(BlakeCopy, self).__init__(*args, **kwargs)

    @property
    def to_dict(self):
        return {
            "copy_id": self.copy_id,
            "work_id": self.work_id,
            "bad_id": self.bad_id,
            "source": self.source,
            "title": self.title,
            "institution": self.institution,
            "image": self.image,
            "header": self.header
        }


class BlakeWork(db.Model):
    __tablename__ = "work"
    work_id = db.Column(db.Integer, primary_key=True)
    bad_id = db.Column(db.Text, index=True)
    title = db.Column(db.UnicodeText)
    medium = db.Column(db.UnicodeText)
    copies = db.relationship(BlakeCopy, backref="work")
    info = db.Column(db.UnicodeText)
    composition_date = db.Column(db.Integer)
    composition_date_string = db.Column(db.UnicodeText)

    @property
    def to_dict(self):
        return {
            "work_id": self.work_id,
            "bad_id": self.bad_id,
            "title": self.title,
            "medium": self.medium,
            "info": self.info,
            "composition_date": self.composition_date,
            "composition_date_string": self.composition_date_string
        }


class BlakeFeaturedWork(db.Model):
    __tablename__ = "featured_work"
    featured_work_id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.UnicodeText)
    byline = db.Column(db.UnicodeText)
    desc_id = db.Column(db.UnicodeText)
    dbi = db.Column(db.UnicodeText)

    @property
    def to_dict(self):
        return {
            "title": self.title,
            "byline": self.byline,
            "dbi": self.dbi,
            "desc_id": self.desc_id
        }
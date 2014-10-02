from flask.ext.sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import JSON, TSVECTOR


db = SQLAlchemy()


class BlakeObject(db.Model):
    __tablename__ = "object"
    object_id = db.Column(db.Integer, primary_key=True)
    copy_id = db.Column(db.Integer, db.ForeignKey("copy.copy_id"))
    document = db.Column(JSON)
    document_vector = db.Column(TSVECTOR, index=True)

    def __init__(self, *args, **kwargs):
        super(BlakeObject, self).__init__(*args, **kwargs)
        self.document_vector = db.func.to_tsvector(self.document)


class BlakeCopy(db.Model):
    __tablename__ = "copy"
    copy_id = db.Column(db.Integer, primary_key=True)
    work_id = db.Column(db.Integer, db.ForeignKey("work.work_id"))
    document = db.Column(JSON)
    document_vector = db.Column(TSVECTOR, index=True)
    objects = db.relationship(BlakeObject, backref="copy")

    def __init__(self, *args, **kwargs):
        super(BlakeCopy, self).__init__(*args, **kwargs)
        self.document_vector = db.func.to_tsvector(self.document)


class BlakeWork(db.Model):
    __tablename__ = "work"
    work_id = db.Column(db.Integer, primary_key=True)
    document = db.Column(JSON)
    document_vector = db.Column(TSVECTOR, index=True)
    copies = db.relationship(BlakeCopy, backref="work")

    def __init__(self, *args, **kwargs):
        super(BlakeWork, self).__init__(*args, **kwargs)
        self.document_vector = db.func.to_tsvector(self.document)


# TODO: Check if virtual work group membership is many-to-many or many-to-one.  Assuming many-to-many for now.
virtual_work_group__work = db.Table(
    "virtual_work_group__work",
    db.Model.metadata,
    db.Column("virtual_work_group_id", db.Integer, db.ForeignKey("virtual_work_group.virtual_work_group_id")),
    db.Column("work_id", db.Integer, db.ForeignKey("work.work_id"))
)


# TODO: check if blake virtual work groups have a document, and amend this model if needed
class BlakeVirtualWorkGroup(db.Model):
    __tablename__ = "virtual_work_group"
    virtual_work_group_id = db.Column(db.Integer, primary_key=True)
    document = db.Column(JSON)
    document_vector = db.Column(TSVECTOR, index=True)
    works = db.relationship(BlakeWork, secondary=virtual_work_group__work)

    def __init__(self, *args, **kwargs):
        super(BlakeVirtualWorkGroup, self).__init__(*args, **kwargs)
        self.document_vector = db.func.to_tsvector(self.document)


# TODO: Check if comparable group membership is many-to-many or many-to-one.  Assuming many-to-many for now.
comparable_group__object = db.Table(
    "comparable_group__object",
    db.Model.metadata,
    db.Column("comparable_group_id", db.Integer, db.ForeignKey("comparable_group.comparable_group_id")),
    db.Column("object_id", db.Integer, db.ForeignKey("object.object_id"))
)


# TODO: check if blake comparable work groups have a document, and amend this model if needed
class BlakeComparableGroup(db.Model):
    __tablename__ = "comparable_group"
    comparable_group_id = db.Column(db.Integer, primary_key=True)
    document = db.Column(JSON)
    document_vector = db.Column(TSVECTOR, index=True)
    objects = db.relationship(BlakeObject, secondary=comparable_group__object)

    def __init__(self, *args, **kwargs):
        super(BlakeComparableGroup, self).__init__(*args, **kwargs)
        self.document_vector = db.func.to_tsvector(self.document)
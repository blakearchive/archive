"""
This module should be the container for mock objects and services used while testing.
"""

from . import data


class MockBlakeDataService(object):
    @classmethod
    def query(cls, config):
        return {
            "objects": data.blake_objects,
            "copies": data.blake_copies,
            "works": data.blake_works
        }

    @classmethod
    def get_object(cls, object_id):
        return data.blake_object_1

    @classmethod
    def get_copy(cls, copy_id):
        return data.blake_copy_1

    @classmethod
    def get_work(cls, work_id):
        return data.blake_work_1

    @classmethod
    def get_virtual_work_group(cls, virtual_work_group_id):
        return data.blake_virtual_work_group_1

    @classmethod
    def get_comparable_group(cls, comparable_group_id):
        return data.blake_comparable_group_1
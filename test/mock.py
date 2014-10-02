"""
This module should be the container for mock objects and services used while testing.
"""

from . import data

class MockBlakeDataService(object):
    @classmethod
    def query(cls, config):
        #
        return data.blake_objects
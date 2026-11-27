import unittest
from unittest.mock import patch

from blakearchive.services import BlakeDataService


class ObjectSearchFacetTests(unittest.TestCase):
    @patch("blakearchive.services.blake_object_solr")
    def test_object_search_requests_all_facet_values(self, solr):
        objects = [{"value": "object-%d" % i, "count": 1} for i in range(101)]
        solr.search.return_value.facets = {
            "facet_pivot": {
                "work_id,copy_id,desc_id": [
                    {"value": "work", "count": 101, "pivot": [
                        {"value": "copy", "count": 101, "pivot": objects}
                    ]}
                ]
            }
        }

        results = BlakeDataService.solr_object_query("characteristics:shadow")

        self.assertEqual(len(results[0][2][0][2]), 101)
        self.assertEqual(solr.search.call_args.kwargs["facet.limit"], -1)


if __name__ == "__main__":
    unittest.main()

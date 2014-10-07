"""
This module should contain a data set to be used for testing purposes.
"""

from blakearchive import models

# TODO: replace this example json with actual examples generated from blake archive data
_example_json = """
{
    "glossary": {
        "title": "example glossary",
		"GlossDiv": {
            "title": "S",
			"GlossList": {
                "GlossEntry": {
                    "ID": "SGML",
					"SortAs": "SGML",
					"GlossTerm": "Standard Generalized Markup Language",
					"Acronym": "SGML",
					"Abbrev": "ISO 8879:1986",
					"GlossDef": {
                        "para": "A meta-markup language, used to create markup languages such as DocBook.",
						"GlossSeeAlso": ["GML", "XML"]
                    },
					"GlossSee": "markup"
                }
            }
        }
    }
}
"""

blake_object_1 = models.BlakeObject(document=_example_json)
blake_copy_1 = models.BlakeCopy(document=_example_json, objects=[blake_object_1])
blake_work_1 = models.BlakeWork(document=_example_json, copies=[blake_copy_1])
blake_virtual_work_group_1 = models.BlakeVirtualWorkGroup(document=_example_json, works=[blake_work_1])
blake_comparable_group_1 = models.BlakeComparableGroup(document=_example_json, objects=[blake_object_1])
blake_objects = [blake_object_1]
blake_copies = [blake_copy_1]
blake_works = [blake_work_1]
blake_virtual_work_groups = [blake_virtual_work_group_1]
blake_comparable_groups = [blake_comparable_group_1]
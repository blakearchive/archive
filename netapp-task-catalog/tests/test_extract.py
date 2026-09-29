"""Regression tests for the AsciiDoc task extractor.

Run: python -m pytest netapp-task-catalog/tests  (or python tests/test_extract.py)
"""
import os
import sys
import tempfile

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "tools"))
import extract_tasks  # noqa: E402

TABBED = """---
permalink: volumes/capacity.html
summary: "Beginning with ONTAP 9.13.1, you can set capacity limits for an SVM."
---
= Manage SVM capacity limits

.Before you begin
* You must be a cluster administrator.

== Set a capacity limit on a new SVM

[role="tabbed-block"]
====
.System Manager
--
.Steps
. Select *Storage* > *Storage VMs*.
. Under *Storage VM settings*, select *Enable maximum capacity limit*.
+
Provide a maximum capacity size for the SVM.
. Select *Save*.
--

.CLI
--
.Steps
. Create the SVM:
+
[source,cli]
----
vserver create -vserver <vserver_name> -storage-limit <value>
----
. Confirm the SVM was created:
+
[source,cli]
----
cluster1::> vserver show -vserver <vserver_name>
----
--
====
"""

PHASED = """= Replace a fan

== Step 1: Shut down the controller

.Steps
. Disconnect the power cables from the power supply.
. Loosen the thumbscrew and pull the canister out of the chassis.

== Step 2: Replace the fan

.Steps
. Unplug the fan cable and remove the fan from the chassis.
. Seat the replacement fan and reconnect the cable.
"""

REST_WORKFLOW = """= Create an EMS notification using the ONTAP REST API

== Step 1: Configure the email settings

You can issue the following API call to configure the system-wide email settings.

.Curl example

[source,curl]
curl --request PATCH \\
--location "https://$FQDN_IP/api/support/ems?mail_from=a@b.com"

== Step 2: Define a message filter

You can issue an API call to define a filter rule.

.Curl example

[source,curl]
curl --request POST \\
--location "https://$FQDN_IP/api/support/ems/filters"
"""

STEPS_INTRO_THEN_TABS = """= Resynchronize an SVM destination

.Steps
You can use System Manager or the ONTAP CLI to perform this task.

[role="tabbed-block"]
====
.System Manager
--
. Click *Protection > Relationships*.
. Click *Resync*.
--

.CLI
--
. Resynchronize the relationship:
+
[source,cli]
----
snapmirror resync -destination-path <svm>:
----
--
====
"""


def extract(text, name="page-task.adoc"):
    with tempfile.TemporaryDirectory() as d:
        path = os.path.join(d, name)
        with open(path, "w") as fh:
            fh.write(text)
        tasks, _ = extract_tasks.extract_page(path, d, "ontap", {})
    return tasks


def test_tabbed_block_becomes_one_task_with_two_methods():
    tasks = extract(TABBED)
    assert len(tasks) == 1
    t = tasks[0]
    assert t["title"] == "Set a capacity limit on a new SVM"
    assert t["interfaces"] == ["cli", "gui"]
    gui, cli = t["methods"]
    assert gui["interface_label"] == "System Manager" and len(gui["steps"]) == 3
    assert gui["steps"][1]["details"] == ["Provide a maximum capacity size for the SVM."]
    assert cli["cli_commands"] == ["vserver create", "vserver show"]
    assert t["prerequisites"] == ["- You must be a cluster administrator."]
    assert t["version_notes"] == ["ONTAP 9.13.1"]


def test_step_headings_merge_into_one_phased_hardware_task():
    tasks = extract(PHASED)
    assert len(tasks) == 1
    t = tasks[0]
    assert t["phased"] and t["title"] == "Replace a fan"
    steps = t["methods"][0]["steps"]
    assert [s["text"] for s in steps] == ["Shut down the controller", "Replace the fan"]
    assert all(len(s["substeps"]) == 2 for s in steps)
    assert t["interfaces"] == ["hardware"]


def test_rest_workflow_sections_without_lists():
    tasks = extract(REST_WORKFLOW, "wf_ems_create_notification.adoc")
    assert len(tasks) == 1
    m = tasks[0]["methods"][0]
    assert tasks[0]["interfaces"] == ["api"]
    assert "PATCH /api/support/ems" in m["rest_calls"]
    assert "POST /api/support/ems/filters" in m["rest_calls"]


def test_steps_intro_followed_by_tabs_uses_the_tabs():
    tasks = extract(STEPS_INTRO_THEN_TABS)
    assert len(tasks) == 1
    labels = [m["interface_label"] for m in tasks[0]["methods"]]
    assert labels == ["System Manager", "CLI"]
    assert tasks[0]["methods"][1]["cli_commands"] == ["snapmirror resync"]


NESTED_BULLETS = """= Add a bucket

.Steps
. Select the storage class:
+
* *Standard*: frequently accessed data.
* *Nearline*: accessed less than once a month.
. Select the protection settings.
. Click *Add*.
"""

BROKEN_BY_NOTE = """= Enable rebalancing

.Steps
. Select *Storage* > *Volumes*.
. Select the FlexGroup volume.

[NOTE]
====
Rebalancing is only available for FlexGroup volumes.
====

[start=3]
. Select *Enable rebalancing*.
. Click *Save*.

The volume is rebalanced in the background.
"""


def test_attached_bullets_do_not_swallow_following_steps():
    steps = extract(NESTED_BULLETS)[0]["methods"][0]["steps"]
    assert [s["n"] for s in steps] == [1, 2, 3]
    assert len(steps[0]["options"]) == 2
    assert steps[2]["text"] == "Click **Add**."


def test_procedure_continues_after_unattached_note():
    m = extract(BROKEN_BY_NOTE)[0]["methods"][0]
    assert [s["n"] for s in m["steps"]] == [1, 2, 3, 4]
    assert m["steps"][1]["notes"] == ["Rebalancing is only available for FlexGroup volumes."]
    assert m["result"] == ["The volume is rebalanced in the background."]


def test_tagged_include_selects_only_the_tag():
    with tempfile.TemporaryDirectory() as d:
        os.makedirs(os.path.join(d, "_include"))
        with open(os.path.join(d, "_include", "frag.adoc"), "w") as fh:
            fh.write("// tag::a[]\n. Step from A.\n// end::a[]\n// tag::b[]\n. Step from B.\n// end::b[]\n")
        path = os.path.join(d, "page-task.adoc")
        with open(path, "w") as fh:
            fh.write("= Page\n\n.Steps\ninclude::_include/frag.adoc[tag=b]\n")
        tasks, _ = extract_tasks.extract_page(path, d, "x", {})
    assert [s["text"] for s in tasks[0]["methods"][0]["steps"]] == ["Step from B."]


DISCRETE_AND_TABLE = """= Configure federation

.Steps
. Select *Federation*.
. Enter your domain details:
+
[cols="1a,3a" options="header"]
|===
| Field| Description

| Name
| A descriptive name.

| Port
| The port to use.
|===

[discrete]
====== Connection method

[start=3]
. Choose *Provider*.
. Select *Next*.
"""


def test_discrete_heading_and_table_inside_procedure():
    steps = extract(DISCRETE_AND_TABLE)[0]["methods"][0]["steps"]
    assert [s["n"] for s in steps] == [1, 2, 3, 4]
    assert steps[1]["details"][0] == "Field | Description\nName | A descriptive name.\nPort | The port to use."


if __name__ == "__main__":
    for name, fn in list(globals().items()):
        if name.startswith("test_"):
            fn()
            print("ok", name)

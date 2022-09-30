import json

from flask import Blueprint, request, current_app, jsonify, abort

from blakearchive import config

api = Blueprint('api', __name__, url_prefix='/api')


@api.route('/query_objects', methods=["POST"])
def query_objects():
    request_config = request.get_json()
    blake_data_service = current_app.config["BLAKE_DATA_SERVICE"]
    results = blake_data_service.query_objects(request_config)
    return json.dumps(results)


@api.route('/query_copies', methods=["POST"])
def query_copies():
    request_config = request.get_json()
    blake_data_service = current_app.config["BLAKE_DATA_SERVICE"]
    results = blake_data_service.query_copies(request_config)
    return json.dumps(results)


@api.route('/query_works', methods=["POST"])
def query_works():
    request_config = request.get_json()
    blake_data_service = current_app.config["BLAKE_DATA_SERVICE"]
    results = blake_data_service.query_works(request_config)
    return json.dumps(results)


@api.route('/object/<desc_id>')
def get_object(desc_id):
    blake_data_service = current_app.config["BLAKE_DATA_SERVICE"]
    results = blake_data_service.get_object(desc_id)
    return jsonify(results.to_dict)


@api.route('/object/')
def get_objects():
    if "desc_ids" in request.args:
        selected_object_ids = request.args.get("desc_ids", "").split(",")
    else:
        selected_object_ids = None
    blake_data_service = current_app.config["BLAKE_DATA_SERVICE"]
    results = blake_data_service.get_objects(selected_object_ids)
    return jsonify({"results": [r.to_dict for r in results]})


@api.route('/object/<desc_id>/objects_with_same_motif')
def get_objects_with_same_motif(desc_id):
    blake_data_service = current_app.config["BLAKE_DATA_SERVICE"]
    results = blake_data_service.get_objects_with_same_motif(desc_id)
    return jsonify({"results": [r.to_dict for r in results]})


@api.route('/object/<desc_id>/objects_from_same_production_sequence')
def get_objects_from_same_production_sequence(desc_id):
    blake_data_service = current_app.config["BLAKE_DATA_SERVICE"]
    results = blake_data_service.get_objects_from_same_production_sequence(desc_id)
    return jsonify({"results": [r.to_dict for r in results]})


@api.route('/object/<desc_id>/objects_with_text_matches')
def get_objects_with_text_matches(desc_id):
    blake_data_service = current_app.config["BLAKE_DATA_SERVICE"]
    results = blake_data_service.get_objects_with_text_matches(desc_id)
    return jsonify({"results": [r.to_dict for r in results]})


@api.route('/object/<desc_id1>/<desc_id2>/fragment_pair')
def get_fragment_pair(desc_id1, desc_id2):
    blake_data_service = current_app.config["BLAKE_DATA_SERVICE"]
    result = blake_data_service.get_fragment_pair(desc_id1, desc_id2)
    return jsonify(result.to_dict)


@api.route('/object/<desc_id>/objects_from_same_matrix')
def get_objects_from_same_matrix(desc_id):
    blake_data_service = current_app.config["BLAKE_DATA_SERVICE"]
    results = blake_data_service.get_objects_from_same_matrix(desc_id)
    return jsonify({"results": [r.to_dict for r in results]})


@api.route('/object/<desc_id>/<bad_id>')
def get_same_matrix_object_from_other_copy(desc_id, bad_id):
    blake_data_service = current_app.config["BLAKE_DATA_SERVICE"]
    result = blake_data_service.get_same_matrix_object_from_other_copy(desc_id, bad_id)
    if result is not None:
        return jsonify(result)
    else:
        return jsonify(blake_data_service.get_object(desc_id))


@api.route('/object/<desc_id>/textually_referenced_materials')
def get_textually_referenced_material(desc_id):
    blake_data_service = current_app.config["BLAKE_DATA_SERVICE"]
    results = blake_data_service.get_textually_referenced_materials(desc_id)
    return jsonify({
        "objects": [r.to_dict for r in results["objects"]],
        "copies": [r.to_dict for r in results["copies"]],
        "works": [r.to_dict for r in results["works"]]
    })


@api.route('/object/<desc_id>/supplemental_objects')
def get_supplemental_objects(desc_id):
    blake_data_service = current_app.config["BLAKE_DATA_SERVICE"]
    results = blake_data_service.get_supplemental_objects(desc_id)
    return jsonify({"results": [r.to_dict for r in results]})


@api.route('/copy/')
def get_copies():
    if "bad_ids" in request.args:
        selected_bad_ids = request.args.get("bad_ids", "").split(",")
    else:
        selected_bad_ids = None
    blake_data_service = current_app.config["BLAKE_DATA_SERVICE"]
    results = blake_data_service.get_copies(selected_bad_ids)
    return jsonify({"results": [r.to_dict for r in results]})


@api.route('/copy/<copy_id>')
def get_copy(copy_id):
    blake_data_service = current_app.config["BLAKE_DATA_SERVICE"]
    result = blake_data_service.get_copy(copy_id)
    return jsonify(result.to_dict)


@api.route('/copy/<copy_id>/objects')
def get_objects_for_copy(copy_id):
    blake_data_service = current_app.config["BLAKE_DATA_SERVICE"]
    results = blake_data_service.get_objects_for_copy(copy_id)
    return jsonify({"results": [r.to_dict for r in results]})


@api.route('/work/<work_id>/copies')
def get_copies_for_work(work_id):
    blake_data_service = current_app.config["BLAKE_DATA_SERVICE"]
    results = blake_data_service.get_copies_for_work(work_id)
    return jsonify({"results": [r.to_dict for r in results]})


@api.route('/work/<work_id>')
def get_work(work_id):
    blake_data_service = current_app.config["BLAKE_DATA_SERVICE"]
    result = blake_data_service.get_work(work_id)
    if not result:
        return abort(404)
    return jsonify(result.to_dict)


@api.route('/work/')
def get_works():
    if "bad_ids" in request.args:
        selected_bad_ids = request.args.get("bad_ids", "").split(",")
    else:
        selected_bad_ids = None
    blake_data_service = current_app.config["BLAKE_DATA_SERVICE"]
    results = blake_data_service.get_works(selected_bad_ids)
    return jsonify({"results": [r.to_dict for r in results]})


@api.route('/featured_work/')
def get_featured_works():
    blake_data_service = current_app.config["BLAKE_DATA_SERVICE"]
    results = blake_data_service.get_featured_works()
    return jsonify({"results": [r.to_dict for r in results]})


@api.route("/exhibit/<exhibit_id>")
def get_exhibit_by_id(exhibit_id):
    blake_data_service = current_app.config["BLAKE_DATA_SERVICE"]
    result = blake_data_service.get_exhibit(exhibit_id)

    if not result:
        return abort(404)
    images = blake_data_service.get_images_for_exhibit(exhibit_id)

    return jsonify({"exhibit": result.to_dict, "images": [r.to_dict for r in images]})


@api.route("/exhibit-images/<exhibit_id>")
def get_exhibit_images(exhibit_id):
    blake_data_service = current_app.config["BLAKE_DATA_SERVICE"]
    results = blake_data_service.get_images_for_exhibit(exhibit_id)
    if not results:
        return abort(404)
    return jsonify({"results": [r.to_dict for r in results]})


@api.route("/preview/<preview_id>")
def get_preview_by_id(preview_id):
    blake_data_service = current_app.config["BLAKE_DATA_SERVICE"]
    result = blake_data_service.get_preview(preview_id)

    if not result:
        return abort(404)
    images = blake_data_service.get_images_for_preview(preview_id)

    return jsonify({"preview": result.to_dict, "images": [r.to_dict for r in images]})


@api.route("/preview-images/<preview_id>")
def get_preview_images(preview_id):
    blake_data_service = current_app.config["BLAKE_DATA_SERVICE"]
    results = blake_data_service.get_images_for_preview(preview_id)
    if not results:
        return abort(404)
    return jsonify({"results": [r.to_dict for r in results]})


@api.route("/exhibit-captions/<exhibit_id>/<image_id>")
def get_exhibit_image_captions(exhibit_id, image_id):
    blake_data_service = current_app.config["BLAKE_DATA_SERVICE"]
    results = blake_data_service.get_captions_for_image(exhibit_id, image_id)
    if not results:
        return abort(404)
    return jsonify({"results": [r.to_dict for r in results]})


@api.route("/exhibit-html/<exhibit_id>")
def get_exhibit_html(exhibit_id):
    filename = config.local_data_path+"/exhibits/"+exhibit_id+"/"+exhibit_id+".exhibit.html"
    exhib_html_file = open(filename, 'r')
    return exhib_html_file.read()


@api.route("/exhibits/")
def get_exhibits():
    blake_data_service = current_app.config["BLAKE_DATA_SERVICE"]
    results = blake_data_service.get_exhibits()
    return jsonify({"results": [r.to_dict for r in results]})


@api.route("/previews/")
def get_previews():
    blake_data_service = current_app.config["BLAKE_DATA_SERVICE"]
    results = blake_data_service.get_previews()
    return jsonify({"results": [r.to_dict for r in results]})

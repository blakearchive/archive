import json

from flask import Blueprint, request, current_app, jsonify, abort
import config

if hasattr(config, "production") and config.production:
    api = Blueprint('api', __name__, url_prefix='/api')
else:
    api = Blueprint('api', __name__, url_prefix='/blake/api')


@api.route('/query_objects', methods=["POST"])
def query_objects():
    config = request.get_json()
    blake_data_service = current_app.config["BLAKE_DATA_SERVICE"]
    results = blake_data_service.query_objects(config)
    return json.dumps(results)


@api.route('/query_copies', methods=["POST"])
def query_copies():
    config = request.get_json()
    blake_data_service = current_app.config["BLAKE_DATA_SERVICE"]
    results = blake_data_service.query_copies(config)
    return json.dumps(results)


@api.route('/query_works', methods=["POST"])
def query_works():
    config = request.get_json()
    blake_data_service = current_app.config["BLAKE_DATA_SERVICE"]
    results = blake_data_service.query_works(config)
    return json.dumps(results)


@api.route('/object/<int:object_id>')
def get_object(object_id):
    blake_data_service = current_app.config["BLAKE_DATA_SERVICE"]
    results = blake_data_service.get_object(object_id)
    return jsonify(results.to_dict)


@api.route('/object/')
def get_objects():
    if "object_ids" in request.args:
        selected_object_ids = request.args.get("object_ids", "").split(",")
    else:
        selected_object_ids = []
    blake_data_service = current_app.config["BLAKE_DATA_SERVICE"]
    results = blake_data_service.get_objects(selected_object_ids)
    return jsonify({"results": [r.to_dict for r in results]})


@api.route('/object/<int:object_id>/objects_with_same_motif')
def get_objects_with_same_motif(object_id):
    blake_data_service = current_app.config["BLAKE_DATA_SERVICE"]
    results = blake_data_service.get_objects_with_same_motif(object_id)
    return jsonify({"results": [r.to_dict for r in results]})


@api.route('/object/<int:object_id>/objects_from_same_production_sequence')
def get_objects_from_same_production_sequence(object_id):
    blake_data_service = current_app.config["BLAKE_DATA_SERVICE"]
    results = blake_data_service.get_objects_from_same_production_sequence(object_id)
    return jsonify({"results": [r.to_dict for r in results]})


@api.route('/object/<int:object_id>/objects_from_same_matrix')
def get_objects_from_same_matrix(object_id):
    blake_data_service = current_app.config["BLAKE_DATA_SERVICE"]
    results = blake_data_service.get_objects_from_same_matrix(object_id)
    return jsonify({"results": [r.to_dict for r in results]})


@api.route('/copy/')
def get_copies():
    if "bad_ids" in request.args:
        selected_bad_ids = request.args.get("bad_ids", "").split(",")
    else:
        selected_bad_ids = []
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
        selected_bad_ids = []
    blake_data_service = current_app.config["BLAKE_DATA_SERVICE"]
    results = blake_data_service.get_works(selected_bad_ids)
    return jsonify({"results": [r.to_dict for r in results]})


@api.route('/featured_work/')
def get_featured_works():
    blake_data_service = current_app.config["BLAKE_DATA_SERVICE"]
    results = blake_data_service.get_featured_works()
    return jsonify({"results": [r.to_dict for r in results]})

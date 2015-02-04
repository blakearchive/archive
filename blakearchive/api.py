import json

from flask import Blueprint, request, current_app, jsonify


api = Blueprint('api', __name__, url_prefix='/blake/api')


@api.route('/query', methods=["POST"])
def query():
    config = request.get_json()
    blake_data_service = current_app.config["BLAKE_DATA_SERVICE"]
    results = blake_data_service.query_objects(config)
    return json.dumps(results)


@api.route('/object/<int:object_id>')
def get_object(object_id):
    blake_data_service = current_app.config["BLAKE_DATA_SERVICE"]
    results = blake_data_service.get_object(object_id)
    return jsonify(results.to_dict)


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


@api.route('/copy/<int:copy_id>')
def get_copy(copy_id):
    blake_data_service = current_app.config["BLAKE_DATA_SERVICE"]
    result = blake_data_service.get_copy(copy_id)
    return jsonify(result.to_dict)


@api.route('/copy/<int:copy_id>/objects')
def get_objects_for_copy(copy_id):
    blake_data_service = current_app.config["BLAKE_DATA_SERVICE"]
    results = blake_data_service.get_objects_for_copy(copy_id)
    return jsonify({"results": [r.to_dict for r in results]})


@api.route('/work/<int:work_id>/copies')
def get_copies_for_work(work_id):
    blake_data_service = current_app.config["BLAKE_DATA_SERVICE"]
    results = blake_data_service.get_copies_for_work(work_id)
    return jsonify({"results": [r.to_dict for r in results]})


@api.route('/work/<int:work_id>')
def get_work(work_id):
    blake_data_service = current_app.config["BLAKE_DATA_SERVICE"]
    result = blake_data_service.get_work(work_id)
    return jsonify(result.to_dict)


@api.route('/work/')
def get_works():
    blake_data_service = current_app.config["BLAKE_DATA_SERVICE"]
    results = blake_data_service.get_works()
    return jsonify({"results": [r.to_dict for r in results]})


@api.route('/featured_work/')
def get_featured_works():
    blake_data_service = current_app.config["BLAKE_DATA_SERVICE"]
    results = blake_data_service.get_featured_works()
    return jsonify({"results": [r.to_dict for r in results]})

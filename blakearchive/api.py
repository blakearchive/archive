from flask import Blueprint, request, current_app, jsonify


api = Blueprint('api', __name__, url_prefix='/api')


@api.route('/query', methods=["POST"])
def query():
    config = request.get_json()
    blake_data_service = current_app.config["BLAKE_DATA_SERVICE"]
    results = blake_data_service.query(config)
    return jsonify({
        "objects": [o.to_dict for o in results["objects"]],
        "works": [w.to_dict for w in results["works"]],
        "copies": [c.to_dict for c in results["copies"]]
    })


@api.route('/object/<int:object_id>')
def get_object(object_id):
    blake_data_service = current_app.config["BLAKE_DATA_SERVICE"]
    results = blake_data_service.get_object(object_id)
    return jsonify(results.to_dict)


@api.route('/copy/<int:copy_id>')
def get_copy(copy_id):
    blake_data_service = current_app.config["BLAKE_DATA_SERVICE"]
    results = blake_data_service.get_copy(copy_id)
    return jsonify(results.to_dict)


@api.route('/work/<int:work_id>')
def get_work(work_id):
    blake_data_service = current_app.config["BLAKE_DATA_SERVICE"]
    results = blake_data_service.get_work(work_id)
    return jsonify(results.to_dict)


@api.route('/virtual_work_group/<int:virtual_work_group_id>')
def get_virtual_work_group(virtual_work_group_id):
    blake_data_service = current_app.config["BLAKE_DATA_SERVICE"]
    results = blake_data_service.get_virtual_work_group(virtual_work_group_id)
    return jsonify(results.to_dict)


@api.route('/comparable_group/<int:comparable_group_id>')
def get_comparable_group(comparable_group_id):
    blake_data_service = current_app.config["BLAKE_DATA_SERVICE"]
    results = blake_data_service.get_comparable_group(comparable_group_id)
    return jsonify(results.to_dict)


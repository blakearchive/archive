from flask import send_file
from blakearchive import app, models, services, config
# from test.mock import MockBlakeDataService

# Configuration for local test runs belongs here
app.config["DEBUG"] = True
app.config["SECRET_KEY"] = config.app_secret_key
app.config["SQLALCHEMY_DATABASE_URI"] = config.db_connection_string
app.config["BLAKE_DATA_SERVICE"] = services.BlakeDataService
# The database object must initialize the app in order to be able to perform queries
models.db.init_app(app)


@app.route('/images/<image>')
def get_image(image=None):
    return send_file(config.local_image_path+image)


@app.route('/images/<imageFiles>/<number>/<image>')
def get_image_files(imageFiles=None, number=None, image=None):
    return send_file(config.local_image_path+'/'+imageFiles+'/'+number+'/' + image)


@app.route('/images/exhibits/<exhibitId>/<image>')
def get_exhibit_image(exhibitId=None, image=None):
    return send_file(config.local_image_path+'exhibits/'+exhibitId+'/' + image)


@app.route('/images/previews/<image>')
def get_seadragon_image(previewId=None, image=None):
    return send_file(config.local_image_path+'previews/'+ image)


@app.route('/images/previews/<previewId>/<image>')
def get_preview_image(previewId=None, image=None):
    return send_file(config.local_image_path+'previews/'+previewId+'/' + image)


@app.route('/lightbox')
def get_lightbox(path=None):
    return send_file("static/html/lightbox.html")


@app.route('/cropper/<path>')
def get_cropper(path=None):
    return send_file("static/html/lightbox.html")


@app.route('/icon/<icon>')
def get_icon(icon=None):
    return send_file("static/img/global/"+icon)


@app.route('/bad/<bad>')
def get_bad_file(bad=None):
    return send_file(config.local_data_path+"works/"+bad)


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    """
    This catch all path is used for testing purposes.  In production this should be handled by the web server.
    """
    return send_file("static/html/main.html")


if __name__ == "__main__":
    app.run(port=8002)

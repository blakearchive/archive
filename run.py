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


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    """
    This catch all path is used for testing purposes.  In production this should be handled by the web server.
    """
    return send_file("static/html/main.html")


if __name__ == "__main__":
    app.run(port=8002)

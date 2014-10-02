from flask import send_file
from blakearchive import app, models
from test.mock import MockBlakeDataService

# Configuration for local test runs belongs here
app.config["DEBUG"] = True
app.config["SECRET_KEY"] = "not_so_secret_key"
app.config["SQLALCHEMY_DATABASE_URI"] = 'postgres://user:password@host/database'
app.config["BLAKE_DATA_SERVICE"] = MockBlakeDataService
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
    with app.app_context():
        models.db.drop_all()
        models.db.create_all()
    app.run()

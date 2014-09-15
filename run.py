from flask import send_file
from blakearchive import app

# Configuration for local test runs belongs here
app.config["DEBUG"] = True
app.config["SECRET_KEY"] = "not_so_secret_key"


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    """
    This catch all path is used for testing purposes.  In production this should be handled by the web server.
    """
    return send_file("static/html/main.html")


if __name__ == "__main__":
    app.run()

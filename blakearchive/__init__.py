from flask import Flask
from .api import api
from blakearchive import config

if hasattr(config, "production") and config.production:
    app = Flask(__name__)
else:
    app = Flask(__name__, static_url_path='/static', static_folder='static')


# Blueprints should be registered here
app.register_blueprint(api)

# Routes can be defined here
from flask import Flask
from .api import api

app = Flask(__name__, static_url_path='/blake/static', static_folder='static')

# Blueprints should be registered here
app.register_blueprint(api)

# Routes can be defined here
import sys
from blakearchive import config
sys.path.insert(0, config.wsgi_path)
from run import app as application

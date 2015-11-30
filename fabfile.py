from __future__ import with_statement
from fabric.api import settings, run, cd, env
import fab_settings
from blakearchive.solrimport import main as solr_ingest


env.hosts = [fab_settings.production['server']]
env.user = fab_settings.production['username']
env.password = fab_settings.production['pass']

def deploy(code_dir="/htdocs/webdata/blake/archive", production=True):
    """
    Update things
    """
    with settings(warn_only=True):
        if run("test -d %s" % code_dir).failed:
            run("sudo git clone https://github.com/blakearchive/archive.git %s" % code_dir)
    with cd(code_dir):
        run("sudo git pull")
        if production:
            run("sudo /usr/local/bin/bounce-webserver.sh graceful")


def update_solr():
    """
    Index production Solr
    """
    solr_ingest()
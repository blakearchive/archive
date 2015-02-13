import os
from setuptools import setup


def read(fname):
    return open(os.path.join(os.path.dirname(__file__), fname)).read()


setup(
    name="blake-archive",
    version="0.1",
    description="Blake archive web app",
    license="Closed source",
    packages=['blake', 'test'],
    long_description=read('README'),
    classifiers=["Development Status :: 3 - Alpha"],
    install_requires=["flask", "sqlalchemy", "flask-sqlalchemy", 'lxml', 'xmltodict', "nose", 'tablib']
)
import os
from setuptools import setup, find_packages


def read(fname):
    return open(os.path.join(os.path.dirname(__file__), fname)).read()


setup(
    name="blake-archive",
    version="0.2.0",
    description="Blake Archive web application",
    long_description=read('README.md'),
    long_description_content_type='text/markdown',
    license="Closed source",
    packages=find_packages(exclude=['test', 'tests', 'frontend']),
    python_requires='>=3.11',
    classifiers=[
        "Development Status :: 4 - Beta",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.11",
        "Framework :: Flask",
    ],
    install_requires=[
        "flask>=3.1.0",
        "sqlalchemy>=2.0.36",
        "flask-sqlalchemy>=3.1.1",
        "lxml>=5.3.0",
        "xmltodict>=0.14.2",
        "tablib>=3.7.0",
        "requests>=2.32.3",
        "pysolr>=3.10.0",
    ],
)

FROM continuumio/anaconda

RUN apt-get install wget ca-certificates -y
RUN wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
RUN apt-get update -y


RUN apt-get install libpq-dev -y
RUN apt-get install python-dev -y
RUN apt-get install  libxslt-dev -y
RUN apt-get install libffi-dev -y
RUN apt-get install python-lxml -y


RUN apt-get install libxml2-dev
RUN apt-get update -y
RUN apt-get install gcc -y


ADD requirements.txt /requirements.txt
ADD .condarc /.condarc

RUN pip install -r /requirements.txt


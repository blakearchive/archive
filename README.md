## Blake Archive Application Redesign

### Setup (for MAC)

#### Postgres
1. Install [Postgresql](http://postgresapp.com/)
2. Start the postgres service
    * Find and click the "Postgres" Elephant icon in you applications, then click "open psql"
    * Or, in terminal, run ```'/Applications/Postgres.app/Contents/Versions/9.5/bin'/psql -p5432```
        * -p = port number
3. Setup your blake database
    * In the postgres terminal, run ```CREATE DATABASE databasename;```

#### Solr
1. [Download and install solr](https://cwiki.apache.org/confluence/display/solr/Installing+Solr)
    * (We're currently uses 5.3.0)
2. Make your solr cores
```bash
cd ~/path/to/solr/instance # if you followed the apache install instructions, it's likely at ~/solr-5.3.0
bin/solr start
cd server/solr
mkdir blake_object
mkdir blake_work
```

#### Capistrano
```gem install capistrano #install capistrano```

#### Code Base
```bash
easy_install pip #install pip
pip install virtualenv #install virtualenv
cd /place/where/you/want/blake/to/live # you do not need to make a dir, that is the next step
virtualenv blake #create the virtual environment
cd blake #cd into the env
source bin/activate #activate the env
git clone https://github.com/blakearchive/archive.git #clone the repo
cd archive #cd into the repo
pip install -r requirements.txt #install the python requirements
npm install #install gulp and gulp modules, need to have node.js installed locally, see below
```

#### Config Files
1. Copy ```config/config.py.example``` to ```blakearchive/```
2. Rename the file ```config.py```
3. Edit db_connection_string with your postgres info
    * the postgres app uses ```postgres``` as the default username with no password, unless you've set your postgres up differently.
    * keep the ```:``` if you have no password
    * ```[host]``` should be ```localhost```
    * ```[dbname]``` should be the database name you created in step 3 of the postgres instructions
4. Make a of ```config/deploy/local.rb.example``` in the same directory, named ```local.rb```
5. Edit the file, setting:
    * your username for you mac
    * path to your solr instance (e.g. ```~/solr.5.3.0```)
    * path to the local repo (e.g. ```~/Sites/blake/archive```)

#### Final steps
In the repo directory ```archive/```:

1. Seed the database and solr by running ```cap local setup:start```
2. Run the python server ```python run.py```
3. You can now view the site at http://localhost:8200/blake

### Running Gulp
You'll need to have [Node.js](https://nodejs.org/en/) installed on your local machine.

CD into the archive/ directory and run ```npm install``` to download and install the required modules below

##### Required NPM modules
* gulp
* gulp-concat
* gulp-cssmin
* gulp-uglify

Running "gulp" from the commandline with no arguments will run the default task which minifies and concatenates the JS
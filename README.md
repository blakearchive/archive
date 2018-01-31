# Blake Archive

## Requirements

### Postgres
On Mac:

1. Install [Postgresql](http://postgresapp.com/)
2. Start the postgres service
    * Find and click the "Postgres" Elephant icon in you applications, then click "open psql"
    * Or, in terminal, run ```'/Applications/Postgres.app/Contents/Versions/9.5/bin'/psql -p5432```
        * -p = port number
3. Setup your blake database
    * In the postgres terminal, run ```CREATE DATABASE blake_archive;```

On Unix:
1. Install [Postgresql](http://postgresapp.com/)
    * sudo apt-get install postgresql
2. Configure postgresql
    * sudo -u postgres psql template1
    * ALTER USER postgres with encrypted password 'blake_archive';
3. Restart postgresql service 
    * sudo systemctl restart postgresql.service
4. Start psql
    * sudo -u postgres psql template1
4. Setup your blake database
    * In the postgres terminal, run ```CREATE DATABASE blake_archive;```


### Solr >= 5.3.x
[Download and install solr](https://cwiki.apache.org/confluence/display/solr/Installing+Solr)

### Ruby & Capistrano
1. Have Ruby?
```ruby -v```
2. Then
```gem install capistrano```

### Python
1. Have Python?
```python --version```

### Node.js


## Local Development Setup (works with Mac/Unix)

### Pre-install packages (Unix)
```bash
sudo apt-get install libxml2-dev libxslt-dev gcc zlib1g-dev
```

### Clone Repo & Install modules/packages/etc (works with Mac/Unix)
```bash
easy_install pip #install pip
pip install virtualenv #install virtualenv
cd /place/where/you/want/blake/to/live # you do not need to make a dir, that is the next step
virtualenv blake #create the virtual environment
cd blake #cd into the env
source bin/activate #activate the env
git clone https://github.com/blakearchive/data.git #clone the blakearchive/data repo
git clone https://github.com/blakearchive/archive.git #clone the blakearchvie/archive repo
cd archive #cd into the repo
pip install -r requirements.txt #install the python requirements
```

### Setup your config
In /blake/archive/
```
cp config.py.example blakearchive/config.py
 ```
1. Edit db_connection_string with your postgres info
    * the postgres app uses ```postgres``` as the default username with no password, unless you've set your postgres up differently.
    * keep the ```:``` if you have no password
    * ```[host]``` should be ```localhost```
    * ```[dbname]``` should be the database name you created in step 3 of the postgres instructions
2. Add the dir where you keep the blake images

### Rsync the blake images
```
rsync -rv <user>@<server>:<img dir> <local_image_path>
```

### Make your solr cores
```bash
cd ~/path/to/solr/instance # if you followed the apache install instructions, it's likely at ~/solr-5.3.0
bin/solr start
cd server/solr
mkdir blake_object
ln -s <path-to-repo>(probably ~/Sites/blake)/archive/solr/blake-object/conf <path-to-solr-install>/server/solr/blake_object/conf
mkdir blake_work
ln -s <path-to-repo>(probably ~/Sites/blake)/archive/solr/blake-work/conf <path-to-solr-install>/server/solr/blake_work/conf
mkdir blake_copy
ln -s <path-to-repo>(probably ~/Sites/blake)/archive/solr/blake-copy/conf <path-to-solr-install>/server/solr/blake_copy/conf
```

Go to http://localhost:8983/solr/admin
Click "Core Admin"
Click "Add Core"
Change **name** and **instanceDir** to **blake_object** and click "Add Core" (repeat for blake_copy & blake_work)

### Seed the data

You'll need a working copy of the data repo. In /blake/ 
```
git clone https://github.com/blakearchive/data.git
```

##### Note:
Virtualenv needs to be active for any python scripts to work. To instantiate virtualenv, run ```source bin/activate``` in the blake/ directory

In /blake/archive/blakearchive
```
python import.py '../../data'
python solrimport.py
python homepageimport.py '../../data'
```

### Run the project
In blake/archive
```
python run.py
```
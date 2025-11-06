# Blake Archive

## Project Structure

This repository contains two frontend implementations:
- **Legacy AngularJS (1.8.3)**: Located in `blakearchive/static/` - Currently in production
- **Modern Angular (v20)**: Located in `frontend/` - New implementation with TypeScript

## Requirements

### Python >= 3.11
The project requires Python 3.11 or higher.

### Node.js >= 18.x
Required for building both the legacy AngularJS and modern Angular frontends.

### PostgreSQL >= 14.x
On Mac:

1. Install [Postgresql](https://postgresapp.com/)
2. Start the postgres service
    * Find and click the "Postgres" Elephant icon in you applications, then click "open psql"
    * Or, in terminal, run `'/Applications/Postgres.app/Contents/Versions/14.4/bin'/psql -p5432`
        * -p = port number
3. Setup your blake database
    * In the postgres terminal, run `CREATE DATABASE blake_archive;`

On Unix:
1. Install [Postgresql](https://postgresapp.com/)
    * sudo apt-get install postgresql
2. Configure postgresql
    * sudo -u postgres psql template1
    * ALTER USER postgres with encrypted password 'blake_archive';
3. Restart postgresql service
    * sudo systemctl restart postgresql.service
4. Start psql
    * sudo -u postgres psql template1
5. Setup your blake database
    * In the postgres terminal, run `CREATE DATABASE blake_archive;`

### Solr >= 8.11.1
[Download and install solr](https://cwiki.apache.org/confluence/display/solr/Installing+Solr)

### Ruby & Capistrano (Optional - for deployment)
1. Have Ruby?
```ruby -v```
2. Then
```gem install capistrano```

## Local Development Setup (Mac/Unix)

### Pre-install packages (Unix)
```bash
sudo apt-get install libxml2-dev libxslt-dev gcc zlib1g-dev
```

### Clone Repo & Install Python Dependencies

Using Pipenv (Recommended):
```bash
cd /place/where/you/want/blake/to/live
git clone https://github.com/blakearchive/data.git
git clone https://github.com/blakearchive/archive.git
cd archive
pip install pipenv
pipenv install
pipenv shell
```

Using pip + virtualenv:
```bash
pip install virtualenv
cd /place/where/you/want/blake/to/live
virtualenv blake
cd blake
source bin/activate
git clone https://github.com/blakearchive/data.git
git clone https://github.com/blakearchive/archive.git
cd archive
pip install -r requirements.txt
```

### Install JavaScript Dependencies

For Legacy AngularJS Build:
```bash
npm install
npm run build
```

For Modern Angular (Development):
```bash
cd frontend
npm install
npm start  # Runs dev server with Flask proxy on http://localhost:4200
```

For Modern Angular (Production):
```bash
cd frontend
npm run build  # Output goes to ../blakearchive/static/ng-dist/
```

### Setup your config
In /blake/archive/
```
cp config.py.example blakearchive/config.py
 ```
1. Edit db_connection_string with your postgres info
    * the postgres app uses `postgres` as the default username with no password
    * keep the `:` if you have no password
    * `[host]` should be `localhost`
    * `[dbname]` should be the database name you created in step 3 of the postgres instructions
2. Add the dir where you keep the blake images

### Rsync the blake images
```
rsync -rv <user>@<server>:<img dir> <local_image_path>
```

### Make your solr cores
```bash
cd ~/path/to/solr/instance
bin/solr start
cd server/solr
mkdir blake_object
ln -s <path-to-repo>/archive/solr/blake-object/conf <path-to-solr-install>/server/solr/blake_object/conf
mkdir blake_work
ln -s <path-to-repo>/archive/solr/blake-work/conf <path-to-solr-install>/server/solr/blake_work/conf
mkdir blake_copy
ln -s <path-to-repo>/archive/solr/blake-copy/conf <path-to-solr-install>/server/solr/blake_copy/conf
```

Go to http://localhost:8983/solr/admin
Click "Core Admin"
Click "Add Core"
Change **name** and **instanceDir** to **blake_object** and click "Add Core" (repeat for blake_copy & blake_work)

### Seed the data

In /blake/archive/blakearchive:
```
python import.py '../../data'
python solrimport.py
python homepageimport.py '../../data'
```

### Run the project
In blake/archive:
```
python run.py
```

The application will be available at http://localhost:5000

## Technology Stack

### Backend
- **Python 3.11+**
- **Flask 3.1.0** - Web framework
- **SQLAlchemy 2.0.36** - ORM
- **PostgreSQL** - Database
- **Apache Solr** - Full-text search

### Legacy Frontend (AngularJS)
- **AngularJS 1.8.3** (EOL)
- **Webpack 5.96.1** - Module bundler
- **Babel 7.26.0** - JavaScript transpiler
- **Bootstrap 3.4.1** - UI framework
- **jQuery 3.7.1** - DOM manipulation
- **OpenSeadragon 5.0.0** - Deep zoom image viewer
- **Fabric.js 6.4.4** - Canvas manipulation

### Modern Frontend (Angular)
- **Angular 20** - Modern web framework
- **TypeScript 5.7+** - Type-safe JavaScript
- **RxJS 7.8+** - Reactive programming
- **Standalone Components** - No NgModules
- **Lazy Loading** - Optimized bundle sizes

## Development Workflow

### Legacy AngularJS Development
```bash
npm run build-watch  # Watches for changes and rebuilds
```

### Modern Angular Development
```bash
cd frontend
npm start  # Dev server with hot reload at http://localhost:4200
```

The Angular dev server proxies API requests to Flask (http://localhost:5000)

## Build Output Locations

- **Legacy AngularJS**: `blakearchive/static/build/bundle.js`
- **Modern Angular**: `blakearchive/static/ng-dist/browser/`

## Migration Status

The project is currently in transition from AngularJS to modern Angular:

✅ **Completed:**
- Angular 20 project structure
- Routing for all 11 main routes
- Core data service (BlakeDataService)
- Home component with featured works
- Scaffolded components for all routes
- Build and deployment configuration

🚧 **In Progress:**
- Implementing remaining component logic
- Migrating 53 AngularJS directives to Angular components
- State management implementation
- UI component library
- Complete styling migration

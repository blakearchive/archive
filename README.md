# Blake Archive

## Project Structure

This repository contains the Blake Archive application:
- **Backend**: Flask application in `blakearchive/`
- **Frontend**: Modern Angular (v20) application in `frontend/`
- **Static Assets**: CSS, fonts, images, and HTML templates in `blakearchive/static/`

## Requirements

### Python >= 3.11
The project requires Python 3.11 or higher.

### Node.js >= 18.x
Required for building and running the Angular frontend.

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

For Development:
```bash
cd frontend
npm install
npm start  # Runs dev server with Flask proxy on http://localhost:4200
```

For Production Build:
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

### Frontend
- **Angular 20** - Modern web framework
- **TypeScript 5.7+** - Type-safe JavaScript
- **RxJS 7.8+** - Reactive programming
- **Standalone Components** - No NgModules
- **Lazy Loading** - Optimized bundle sizes

## Development Workflow

### Angular Development
```bash
cd frontend
npm start  # Dev server with hot reload at http://localhost:4200
```

The Angular dev server proxies API requests to Flask (http://localhost:5000)

### Production Build
```bash
cd frontend
npm run build  # Output: blakearchive/static/ng-dist/browser/
```

## Migration Status

✅ **Migration to Angular 20 Complete!**

All components have been successfully migrated from AngularJS 1.8 to Angular 20:

**Core Services:**
- `BlakeDataService` - Full API integration with all 15+ endpoints
- `SearchService` - Comprehensive search with 15+ filter options and signal-based state
- `CartService` - Shopping cart with localStorage persistence and cross-tab sync

**Components Implemented (11 routes):**
- `Home` - Featured works display
- `Search` - Advanced search interface with filters
- `Work` - Work information and copies listing
- `Copy` - Copy details with object grid/list views
- `Object` - Tabbed interface (image/transcription/info)
- `Lightbox` - Cart management with bulk operations and export
- `Exhibit` - Curated exhibits display
- `Preview` - Preview content viewer
- `Staticpage` - Static HTML content loader
- `Cropper` - Interactive image cropping tool
- `Showme` - Multi-mode popup viewer (objects/transcription/comparison/info)

**Technical Features:**
- Standalone components (no NgModules)
- TypeScript with full type safety
- Signal-based reactive state management
- Lazy loading with code splitting
- RxJS observables for async operations
- Production build: 297.69 KB initial (84.34 KB gzipped)

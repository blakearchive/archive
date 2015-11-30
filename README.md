## Blake Archive Application Redesign

### Code Deployment
Create a file in your local application called fab_settings.py. Its contents should look like this with the field filled in
appropriately:

```python
production = {
    "username": "",
    "server": "",
    "pass": "",
    "db_user": "",
    "db_pass": "",
    "db_name": ""
}
```

fabfile.py contains the Fabric tasks.
Currently there are two.

1. "fab deploy" deploys the code from github and restarts the server.
2. "fab update_solr" rebuilds the solr index.


### Connecting flask to the server
Create a file in the blakearchive directory called config.py. It will be ignored by git, but it allows you to connect to the db and
set your environment, production vs local.

It will need the following variables correctly filled out:

app_secret_key = "not_so_secret_key"

db_connection_string = 'postgres://test:@test.unc.edu/test'

production = False (Note: In this case production refers to whether it sits on a UNC Libraries machine or not. True it does. False it doesn't.)

solr = "lib_dev" (Can have one of three values: "lib_prod" for UNC Libraries production solr core. "lib_dev" for UNC Libraries production solr core. "other" for ITS or local solr core.)

### Running Grunt Tasks
You'll need to have Node.js installed on your local machine.

##### Required NPM modules
* grunt
* grunt-cli
* grunt-contrib-concat
* grunt-contrib-cssmin
* grunt-contrib-ugifly
* grunt-purifycss


Running "grunt" from the commandline with no arguments will run the default task which minifies and concatenates the CSS and
JavaScript files for production.

There is another task "grunt purify", which attempts to pull out unused CSS selectors, but it seems to pull out too much
CSS so run with caution.

http://gruntjs.com/getting-started is helpful in getting set up with grunt.
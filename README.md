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
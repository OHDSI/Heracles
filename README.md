### [UNDER DEVELOPMENT - TESTING PURPOSES ONLY] 
### HERACLES

##### Introduction

Health Enterprise Resource and Care Learning Exploration System (HERACLES) provides descriptive statistics / visualizations for cohorts in an OMOP CDM v4 or V5 database.   It comprises two components, a Runner and a Viewer.  HERACLES Runner allows selection and running of analysis jobs.  HERACLES viewer provides a series of visual reports from these analyses.

HERACLES is a project as part of the Observational Health Data Sciences and Informatics (OHDSI, http://ohdsi.org) collaboration.

##### Features
* Select from existing COHORTs in CDM and choose a set of analyses to run
* Focus on a particular concept group such as medications, conditions, or procedures
* Visualize results through a series of reports similar to [ACHILLES](http://www.ohdsi.org/web/achilles/index.html#/SAMPLE/dashboard)


##### Technology
* HTML5
* Javascript
* Grunt
* Bower
* jQuery
* Bootstrap
* AngularJS
* Typeahead.js

##### System Requirements
* 

##### Dependencies
* Have a version of the [OHDSI WebAPI](https://github.com/OHDSI/WebAPI) running.

##### Getting Started
###### If you want to develop the source, you need install the following.
* Install [Node.js](http://nodejs.org/)
* Install [Bower](http://bower.io/)
<br/>` npm install -g bower `
* Install [Grunt](http://gruntjs.com/getting-started)
<br/>`npm install -g grunt-cli`
* Install grunt dependencies (under the root directory)
<br/>`npm install grunt-contrib-uglify --save-dev`
<br/>`npm install grunt-bower-task --save-dev`
<br/>`npm install grunt-contrib-cssmin --save-dev`
<br/>`npm install grunt-contrib-jshint --save-dev`
<br/>`npm install grunt-contrib-nodeunit --save-dev`
<br/>`npm install grunt-contrib-watch --save-dev`
* Run grunt to kick off the default tasks
<br/>`grunt`
* Run watch to keep minified files up to date (optional)
<br/>`grunt watch`

##### Other Notes
* If you're pointing to a different WebAPI than the default (localhost:8080/WebAPI), do the following
<br/>update the `web_api_url` property in package.json
<br/>Run `grunt initwebapi`
* Modify all *.js/*.css files under src/, then use grunt to minify them
* Everything under /lib should be managed by bower, so don't make any changes there directly
<br/>See the [Bower](http://bower.io/) page for installing new javascript libraries


##### Getting involved
* 
	
##### License
Apache
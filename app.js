var express = require('express'), fs = require("fs");
var _ = require("underscore");

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.use(express.static(__dirname + '/public'));
  app.use(express.logger());
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
});

app.register(".html", require("ejs"));

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

/* The routes object describes all the pages accessible.
 * First level are categories : User guides, development, references
 * second are the pages. The page title is the one shown in the simple 
 * footer navigation div (next and previous). The file and folder attributes 
 * are both used for the path and the route.
 */
var routes = [
  { folder: "create",
    title: "Factory User Guide",
    pages: [
      {file: "templates", title: "Templates", children: ["template-detail", "template-import"]},
      {file: "data", title: "Data"}, 
      {file: "preview", title: "Previewing your application"},
      {file: "addons", title: 'Add-ons'},
      {file: "configuration", title: "Configuration", children: ["configuration-template"]}, 
      {file: "payment", title: "Payment Page"},
      {file: "deploy", title: "Deploying your application"}
    ]
  },
  { folder: "data",
    title: "Datasources User Guide",
    pages: [
      {file: "flickr-photos", title:'Flickr'}, 
      {file: "static-post", title: 'Static'}, 
      {file: "twitter-tweets", title: 'Twitter'}, 
      {file: "youtube-videos", title: 'Youtube'}
    ]
  },
  { folder: "deploy",
    title: "Deploys User Guide",
    hideinmenu: true,
    pages: [
      {file: "chromestore"}, 
      {file: "iosbuild"}
    ]
  },
  { folder: "develop",
    title: "Template Development",
    pages: [
      {file: "intro", title:"Getting started with templates"}, 
      {file: "manifest", title:"Prepare a manifest file"}, 
      {file: "start", title: "Create template entry point(s)"}, 
      {file: "datasources", title: "Bind to datasources"}, 
      {file: "devices", title:"Support multiple devices"},
      {file: "options", title:"Propose more configuration settings"},
      {file: "submit", title: "Submit your template"}, 
      {file: "examples", title: "Examples"}
    ]
  },
  { folder: "datasources",
    title: "Datasources development",
    pages: [
      {file: "intro", title:"Getting started with datasources"}, 
      {file: "prepare", title:"Develop a custom datasource"},
      {file: "normalization", title:"Data normalization"},
      {file: "datajslib", title:"The datajslib library"}, 
      {file: "operators", title:"Datasources operators"},
      {file: "boilerplates", title: "Datasources boilerplates"}
    ]
  },
  { folder: "ref",
    title: "References",
    pages: [
      {file: "package", title: "Template Manifest Reference"}, 
      {file: "templateapi", title: "Template API Reference"},
      {file: "datasource", title: "Datasource item type reference"}, 
      {file: "jsonform", title: "JSON Form Reference"}, 
      {file: "styles", title: "Style Guidelines"}
    ]
  }
];

app.set('view options', {routes: routes});

app.get('/', function(req, res){
  res.render("home", {currentPage: {tab:"home"}});
});

app.get("/doc/dev", function(req,res){
  res.render("documentation", {currentPage: {tab:"doc"}});
});

app.get("/doc/latest", function(req,res){
  res.render("documentation", {currentPage: {tab:"doc"}});
});

app.get('/support', function(req, res){
  res.render("support", {currentPage: {tab: "support"}});
});

app.get('/doc/dev/:category/:page', function(req, res){
  var category = _.find(routes, function(route) {
    return route.folder == req.params.category;
  });
  if(category) {
    var page = _.find(category.pages, function(page) { 
      return page.file == req.params.page;
    });
    if(page) {
      var ejsOptions = {
        currentPage: {tab:"doc", category: category.folder, page: page.file}
      };
      var pagePos = _.indexOf(category.pages, page);
      if(pagePos > 0){
        var prevPage = category.pages[pagePos - 1];
        ejsOptions.navPrev = {
          title: prevPage.title, 
          url: prevPage.file
        };
      }
      if(pagePos < category.pages.length - 1){
        var nextPage = category.pages[pagePos + 1];
        ejsOptions.navNext = {
          title: nextPage.title, 
          url: nextPage.file
        };
      }
      //console.log(category.folder + " / " + page.file);
      res.render(category.folder + "/" + page.file, ejsOptions);      
    }
  } 
});

app.listen(40023, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

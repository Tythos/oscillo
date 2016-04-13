window.addEventListener("load", function() {
	// Load dependencies
	var e = require("elsel");
    var f = require('fetch');
    var dataPath = 'data/testFull.sql';
    
    // Maximize body area and ensure it is refreshed on resize
    var maximize = function() {
        var body = e('body')[0];
        body.setAttribute('style', 'height:' + window.innerHeight + 'px');
    };
    maximize();
    window.addEventListener('resize', maximize);
    
    // Define functions for handling the data store operations
    var getTables = function() {
        var tables = f('ajax?path=' + encodeURIComponent(dataPath) + '&op=getTables');
        tables = JSON.parse(tables);
        return tables.slice(1,tables.length);
    };
    var getQueries = function() {
        var tables = f('ajax?path=' + encodeURIComponent(dataPath) + '&op=getQueries');
        tables = JSON.parse(tables);
        return tables.slice(1,tables.length);
    };
    var getFigures = function() {
        var tables = f('ajax?path=' + encodeURIComponent(dataPath) + '&op=getFigures');
        tables = JSON.parse(tables);
        return tables.slice(1,tables.length);
    };
    
    // Log timestamped messages in status bar
    var log = function(msg) {
        var sb = e('#statusBar');
        var d = new Date();
        sb.innerHTML = '[' + d.toISOString().replace(/T/, ' ').replace(/Z/, '') + '] ' + msg
        window.setTimeout(function() {
            sb.innerHTML = '';
        }, 2500);
    };
    
    // View function loads selected table/query/figure in the workspace
    var view = function(type, name) {
        switch (type) {
            case 'table':
                alert("Viewing table '" + name + "'...");
                break;
            case 'query':
                alert("Viewing query '" + name + "'...");
                break;
            case 'figure':
                alert("Viewing figure '" + name + "'...");
                break;
            default:
                alert("Oh no! That shouldn't happen...")
        }
    };
    
    // Edit function loads selected table/query/figure in the workspace
    var edit = function() {};
    
    // Populate list of tables
    var dd = document.createElement('dd');
    dd.innerHTML = 'TABLES';
    var dt = document.createElement('dt');
    var ul = document.createElement('ul');
    getTables().forEach(function(val,ndx) {
        var li = document.createElement('li');
        var span = document.createElement('span');
        span.innerHTML = '[edit]';
        li.innerHTML = val;
        li.addEventListener('click', function(event) {
            view('table', val);
            event.stopPropagation();
        });
        span.addEventListener('click', function(event) {
            alert('Let us edit a table');
            event.stopPropagation();
        });
        li.appendChild(span);
        ul.appendChild(li);
    });
    dt.appendChild(ul);
    e('#browserList').appendChild(dd);
    e('#browserList').appendChild(dt);
    
    // Populate list of queries
    var dd = document.createElement('dd');
    dd.innerHTML = 'QUERIES';
    var dt = document.createElement('dt');
    var ul = document.createElement('ul');
    getQueries().forEach(function(val,ndx) {
        var li = document.createElement('li');
        var span = document.createElement('span');
        span.innerHTML = '[edit]';
        li.innerHTML = val;
        li.addEventListener('click', function(event) {
            view('query', val);
            event.stopPropagation();
        });
        span.addEventListener('click', function(event) {
            alert('Let us edit a query');
            event.stopPropagation();
        });
        li.appendChild(span);
        ul.appendChild(li);
    });
    dt.appendChild(ul);
    e('#browserList').appendChild(dd);
    e('#browserList').appendChild(dt);
    
    // Populate list of figures
    var dd = document.createElement('dd');
    dd.innerHTML = 'FIGURES';
    var dt = document.createElement('dt');
    var ul = document.createElement('ul');
    getFigures().forEach(function(val,ndx) {
        var li = document.createElement('li');
        var span = document.createElement('span');
        span.innerHTML = '[edit]';
        li.innerHTML = val;
        li.addEventListener('click', function(event) {
            view('figure', val);
            event.stopPropagation();
        });
        span.addEventListener('click', function(event) {
            alert('Let us edit a figure');
            event.stopPropagation();
        });
        li.appendChild(span);
        ul.appendChild(li);
    });
    dt.appendChild(ul);
    e('#browserList').appendChild(dd);
    e('#browserList').appendChild(dt);
    
    log('Finished loading');
});

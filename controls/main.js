window.addEventListener("load", function() {
	// Load dependencies
	var e = require("elsel");
    var f = require('fetch');
    var c = require('chart');
    var dataPath = 'data/testFull.sql';
    var statusTimeout = 0;
    
    // Maximize body area and ensure it is refreshed on resize
    var maximize = function() {
        var body = e('body')[0];
        body.setAttribute('style', 'height:' + window.innerHeight + 'px');
    };
    maximize();
    window.addEventListener('resize', maximize);
    
    // Define functions for handling group data store operations
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
    
    // Define functions for handling individual data table operations
    var getTable = function(name) {
        var table = f('ajax?path=' + encodeURIComponent(dataPath) + '&op=getTable&name=' + name);
        table = JSON.parse(table);
        var headers = table[0]
        var data = table.slice(1,table.length);
        return [headers, data];
    };
    var getQuery = function(name) {
        var table = f('ajax?path=' + encodeURIComponent(dataPath) + '&op=getQuery&name=' + name);
        table = JSON.parse(table);
        var headers = table[0]
        var data = table.slice(1,table.length);
        return [headers, data];
    };
    var getFigure = function(name) {
        var figure = f('ajax?path=' + encodeURIComponent(dataPath) + '&op=getFigure&name=' + name);
        figure = JSON.parse(figure);
        xseries = figure['xdata'];
        yseries = figure['ydata'];
        figure['xdata'] = undefined;
        figure['ydata'] = undefined;
        return [xseries, yseries, figure];
    };
    
    // Log timestamped messages in status bar
    var log = function(msg) {
        var sb = e('#statusBar');
        var d = new Date();
        if (statusTimeout != 0) {
            clearTimeout(statusTimeout);
        }
        sb.innerHTML = '[' + d.toISOString().replace(/T/, ' ').replace(/Z/, '') + '] ' + msg
        statusTimeout = window.setTimeout(function() {
            sb.innerHTML = '';
            statusTimeout = 0;
        }, 1024);
    };
    
    var renderTable = function(headers, data) {
        var ws = e('#workspace');
        ws.innerHTML = '';
        var t = document.createElement('table');
        var r = document.createElement('tr');
        headers.forEach(function(val,ndx) {
            var h = document.createElement('th');
            h.innerHTML = val;
            r.appendChild(h);
        });
        t.appendChild(r);
        data.forEach(function(row,ndx) {
            r = document.createElement('tr');
            row.forEach(function(val,ndx) {
                var col = document.createElement('td');
                col.innerHTML = val;
                r.appendChild(col);
            });
            t.appendChild(r);
        });
        ws.appendChild(t);
    };
    
    var renderFigure = function(xdata, ydata, figure) {
        // Use extended chart.js controller to render this type of figure
        var ws = e('#workspace');
        var cn = 'chartCanvas';
        ws.innerHTML = ''
        var cv = document.createElement('canvas');
        cv.setAttribute('id', cn);
        ws.appendChild(cv);
        switch (figure['type']) {
            case 'line':
                var ctx = cv.getContext('2d');
                var data = {
                    labels: xdata,
                    datasets: [{
                        label: figure['name'],
                        data: ydata,
                        fillColor: "rgba(220,220,220,0.2)",
                        strokeColor: "rgba(220,220,220,1)",
                        pointColor: "rgba(220,220,220,1)",
                        pointStrokeColor: "#fff",
                        pointHighlightFill: "#fff",
                        pointHightlightStroke: "rgba(220,220,220,1)"
                    }]
                };
                var newChart = new c(ctx).Line(data);
                break;
            default:
                alert('Hey--"' + figure['type'] + '" is not a supported figure type');
        }
    };
    
    // View function loads selected table/query/figure in the workspace
    var view = function(type, name) {
        switch (type) {
            case 'table':
                [headers, data] = getTable(name);
                renderTable(headers, data);
                log("Finished loading table '" + name + "'");
                break;
            case 'query':
                [headers, data] = getQuery(name);
                renderTable(headers, data);
                log("Finished loading query '" + name + "'");
                break;
            case 'figure':
                [xseries, yseries, figure] = getFigure(name);
                renderFigure(xseries, yseries, figure);
                break;
            default:
                alert("Oh no! That shouldn't happen...");
        }
    };
    var edit = function(type, name) {
        switch (type) {
            case 'table':
                alert("Editing table '" + name + "'...");
                break;
            case 'query':
                alert("Editing query '" + name + "'...");
                break;
            case 'figure':
                alert("Editing figure '" + name + "'...");
                break;
            default:
                alert("Oh no! This shouldn't happen...");
        }
    };
    
    // Populate list of tables
    var dd = document.createElement('dd');
    dd.innerHTML = 'TABLES';
    var dt = document.createElement('dt');
    var ul = document.createElement('ul');
    getTables().forEach(function(val,ndx) {
        var li = document.createElement('li');
        var span = document.createElement('span');
        span.innerHTML = '[edit]';
        span.setAttribute('class', 'editButton');
        li.innerHTML = val;
        li.addEventListener('click', function(event) {
            view('table', val);
            event.stopPropagation();
        });
        span.addEventListener('click', function(event) {
            //alert("Hey!");
            edit('table', val);
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
        span.setAttribute('class', 'editButton');
        li.innerHTML = val;
        li.addEventListener('click', function(event) {
            view('query', val);
            event.stopPropagation();
        });
        span.addEventListener('click', function(event) {
            edit('query', val);
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
        span.setAttribute('class', 'editButton');
        li.innerHTML = val;
        li.addEventListener('click', function(event) {
            view('figure', val);
            event.stopPropagation();
        });
        span.addEventListener('click', function(event) {
            edit('figure', val);
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

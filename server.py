"""Extends the basic Impulse server model to support AJAX operations on an
   Oscillo data store (i.e., a specified SQLite database file). This include:
    * getTables 

   All AJAX queries return tabular data (a list of lists) that can be parsed by
   either Python or JavaScript identically, but contains a header as the first
   entry (i.e., row).
"""

import cherrypy
import os
import sqlite3
import json

hostIp = "127.0.0.1"
portNumber = 1337

dbCache = {}

def getOscilloPath():
	return os.path.dirname(os.path.realpath(__file__)) + os.sep

class ImpulseServer(object):
    @cherrypy.expose
    def index(self):
        with open(getOscilloPath() + 'main.html', "r") as f:
            return f.read()
            
    @cherrypy.expose
    def ajax(self, path, op, name=None):
        #if path not in dbCache:
            #dbCache[path] = sqlite3.connect(path)
        #db = dbCache[path]
        db = sqlite3.connect(getOscilloPath() + path)
        if op.lower() == 'gettables':
            qry = 'SELECT name FROM sqlite_master WHERE type="table" AND name NOT LIKE "\_%" ESCAPE "\\"'
        elif op.lower() == 'getqueries':
            qry = 'SELECT name FROM _queries'
        elif op.lower() == 'getfigures':
            qry = 'SELECT name FROM _figures'
        elif op.lower() == 'gettable':
            qry = 'SELECT * FROM %s' % name
        elif op.lower() == 'getquery':
            qry = 'SELECT text FROM _queries WHERE name="%s"' % name
            cur = db.execute(qry)
            qry = cur.fetchone()[0]
        elif op.lower() == 'getfigure':
            # Figures require several queries for each series
            qry = 'SELECT * FROM _figures WHERE name="%s"' % name
            cur = db.execute(qry)
            fig = cur.fetchone()
            keys = [k[0] for k in cur.description]
            ndcs = range(len(keys))
            fig = dict([(keys[ndx],fig[ndx]) for ndx in ndcs])
            fig['xdata'] = ImpulseServer.getSeries(db, fig['xseries'], fig['xquery'])
            fig['ydata'] = ImpulseServer.getSeries(db, fig['yseries'], fig['yquery'])
            return json.dumps(fig)
        else:
            raise Exception('Invalid Oscillo data store operation ("%s")' % op)
        print(' :: ' + qry)
        cur = db.execute(qry)
        hdr = [f[0] for f in cur.description]
        rows = [row for row in cur]
        rows.insert(0, hdr)
        db.close()
        return json.dumps(rows)
        
    @staticmethod
    def getSeries(db, series, query):
        qry = 'SELECT text FROM _queries WHERE name="%s"' % query
        cur = db.execute(qry)
        qry = 'SELECT %s FROM (%s)' % (series, cur.fetchone()[0])
        return [r[0] for r in db.execute(qry)]
        
if __name__ == "__main__":
    conf = {
        'global': {
            'server.socket_host': hostIp,
            'server.socket_port': portNumber,
        },
        '/': {
            'tools.sessions.on': True,
            'tools.staticdir.root': getOscilloPath(),
            'tools.staticdir.on': True,
            'tools.staticdir.dir': ".",
        }
    }
    cherrypy.quickstart(ImpulseServer(), '/', conf)

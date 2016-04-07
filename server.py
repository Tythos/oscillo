import cherrypy
import os

hostIp = "127.0.0.1"
portNumber = 1337

class ImpulseServer(object):
	@cherrypy.expose
	def index(self):
		with open("main.html", "r") as f:
			return f.read()
		
if __name__ == "__main__":
	conf = {
		'global': {
			'server.socket_host': hostIp,
			'server.socket_port': portNumber,
		},
		'/': {
			'tools.sessions.on': True,
			'tools.staticdir.root': os.path.abspath(os.getcwd()),
			'tools.staticdir.on': True,
			'tools.staticdir.dir': ".",
		}
	}
	cherrypy.quickstart(ImpulseServer(), '/', conf)

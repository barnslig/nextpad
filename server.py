#!/usr/bin/env python3
import tornado.web
import tornado.ioloop
import nextpad.Main
import nextpad.WebSocket

application = tornado.web.Application([
	(r"/p/(.*)", nextpad.Main.Main),
	(r"/ws", nextpad.WebSocket.WebSocket),
	(r"/static/(.*)", tornado.web.StaticFileHandler, {"path": "static"})
])

if __name__ == "__main__":
	application.listen(8888)
	tornado.ioloop.IOLoop.instance().start()
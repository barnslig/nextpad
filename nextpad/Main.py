import tornado.web
import tornado.template
import uuid
import random

template = tornado.template.Loader("templates/")

class Main(tornado.web.RequestHandler):
	def get(self, padID):
		output = template.load("pad.html").generate(
			padID = padID,
			color = random.randint(0, 16777215)
		)

		self.write(output)
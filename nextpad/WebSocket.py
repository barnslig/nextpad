import tornado.websocket
import uuid
import json

pads = {
	
}

class WebSocket(tornado.websocket.WebSocketHandler):
	def open(self):
		self.session = uuid.uuid1()
		self.write_message('{"text": "foo"}')
		print("{0} opened his socket.".format(self.session))

	def on_message(self, message):
		message = json.loads(message)

		# initial pad id thingy
		if "padID" in message:
			self.padID = message["padID"]

			if self.padID not in pads:
				pads[self.padID] = []
			pads[self.padID].append(self)

		# diff thingy
		if "patch" in message:
			if hasattr(self, "padID"):
				for user in pads[self.padID]:
					if user != self:
						user.write_message(message)

	def on_close(self):
		print("{0} closed his socket.".format(self.session))
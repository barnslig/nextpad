import tornado.websocket
import uuid
import json
import nextpad.Database

pads = {
	
}

class WebSocket(tornado.websocket.WebSocketHandler):
	def open(self):
		self.db = nextpad.Database.Database()
		self.session = uuid.uuid1()
		self.write_message('{"text": "foo"}')

		print("{0} opened his socket.".format(self.session))

	def on_message(self, message):
		message = json.loads(message)

		# initial pad id thingy
		if "padID" in message:
			self.padID = message["padID"]

			# if this pad is not existing
			if not self.db.db.pads.find_one({"padID": self.padID}):
				self.db.db.pads.save({
					"padID": self.padID,
					"last": "Welcome to your brand-new NextPad!",
					"patches": []
				})

			# if this pad has no collaborators yet
			if self.padID not in pads:
				pads[self.padID] = []
			pads[self.padID].append(self)

			# send the current content
			content = self.db.db.pads.find_one({"padID": self.padID})["last"]
			try:
				self.write_message('{"text": "' + content + '"}')
			except:
				pass

		# diff thingy
		if "patch" in message:
			if hasattr(self, "padID"):
				# save the patch-set
				self.db.savePatch(self.padID, message["patch"])

				# push it to all pad collaborators
				for user in pads[self.padID]:
					if user != self:
						try:
							user.write_message(message)
						except:
							pass

	def on_close(self):
		print("{0} closed his socket.".format(self.session))
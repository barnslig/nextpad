import pymongo
import diff_match_patch

class Database:
	def __init__(self):
		self.conn = pymongo.Connection()
		self.db = self.conn["nextpad"]
		self.dmp = diff_match_patch.diff_match_patch()

	def savePatch(self, padID, patch):
		# get the pad document
		pad = self.db.pads.find_one({"padID": padID})
		# add the patch
		pad["patches"].append(patch)
		# get the last full version, patch it and put it again into the database
		pad["last"] = self.dmp.patch_apply(self.dmp.patch_fromText(patch), pad["last"])[0]

		# save the stuff
		self.db.pads.save(pad)

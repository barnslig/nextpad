var NextPad = (function (jQuery) {
	"use strict";

	var $ = jQuery.sub();

	function NextPad(padID) {
		this.config = false;
	}
	(function (fn) {
		fn.run = function() {
			// check if the config is setted
			if(this.config === false) {
				return false;
			}

			var instance = this,
				editable = $(this.config.editable),
				lastContent,
				thisContent,
				patch,
				gotJSON = {},
				dmp = new diff_match_patch();

			// open the websocket
			var ws = new WebSocket(instance.config.ws);
			ws.onopen = function() {
				console.log("WebSocket opened.");
				ws.send(JSON.stringify({"padID": instance.config.padID}));
			};
			ws.onmessage = function(evt) {
				gotJSON = $.parseJSON(evt.data);
				if("text" in gotJSON) {
					editable.html(gotJSON["text"]);
					lastContent = gotJSON["text"];
				} else if("patch" in gotJSON) {
					console.log(gotJSON);
					lastContent = editable.html();
					thisContent = dmp.patch_apply(gotJSON["patch"], lastContent)[0];
					editable.html(thisContent);
				}
			};

			// make the content object editable and set the 
			editable.attr("contenteditable", true)
				.keyup(function() {
					console.log("Keyup!");
					thisContent = editable.html();

					// generate the diff if something changed
					if(lastContent != thisContent) {
						patch = dmp.patch_make(lastContent, thisContent);

						// send it to the server
						ws.send(JSON.stringify({"patch": patch}));

						// save it as last
						lastContent = thisContent;
					}
				});

		};
	}(NextPad.prototype));

	return NextPad;
}(jQuery));
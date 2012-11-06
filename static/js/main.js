var NextPad = (function (jQuery) {
	"use strict";

	var $ = jQuery.sub();

	function NextPad(config) {
		$.editable = $(config.editable);

		this.config = config;
		this.lastContent = "";
		this.thisContent = "";
		this.dmp = new diff_match_patch();
		this.ws = new ReconnectingWebSocket(this.config.ws);
	}
	(function (fn) {
		fn.run = function() {
			// check if the config is setted
			if(this.config === false) {
				return false;
			}

			var instance = this,
				patch,
				gotJSON = {},
				whileTyping;

			// configure the websocket
			instance.ws.onopen = function() {
				// send the initial padID
				instance.ws.send(JSON.stringify({"padID": instance.config.padID}));
			};
			instance.ws.onmessage = function(evt) {
				gotJSON = $.parseJSON(evt.data);
				if("text" in gotJSON) {
					$.editable.html(gotJSON["text"]);
					this.lastContent = gotJSON["text"];

					$('#loading').hide();
				} else if("patch" in gotJSON) {
					instance.applyPatch(gotJSON["patch"]);
				}
			};
			instance.ws.onclose = function() {
				// show the overlay
				$('#loading').show();
			};

			// make the content object editable and set the 
			$.editable.attr("contenteditable", true)
				.typing({
					start: function() {
						// start an interval which is continously sending a patch
						whileTyping = setInterval(function() {
							instance.makeSendPatch();
						}, 700);
					},
					stop: function() {
						// stop the continous interval
						clearInterval(whileTyping);						

						instance.makeSendPatch();
					},
					delay: 300
				});
		};
		fn.applyPatch = function(patch) {
			this.lastContent = $.editable.html();
			this.thisContent = this.dmp.patch_apply(this.dmp.patch_fromText(patch), this.lastContent)[0];
			$.editable.html(this.thisContent);
		};
		fn.makeSendPatch = function() {
			var instance = this,
				patch;

			// get the new content
			instance.thisContent = $.editable.html();

			// generate the diff if something changed
			if(instance.lastContent != instance.thisContent) {
				patch = instance.dmp.patch_toText(instance.dmp.patch_make(instance.lastContent, instance.thisContent));
				// send it to the server
				instance.ws.send(JSON.stringify({"patch": patch}));
				// save it as last
				instance.lastContent = instance.thisContent;
			}
		};
	}(NextPad.prototype));

	return NextPad;
}(jQuery));
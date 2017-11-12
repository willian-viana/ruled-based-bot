var AWS = require("aws-sdk");
var request = require("request");

module.exports = function sendMessage (messageData, token, fn){
	request({
		uri: 'https://graph.facebook.com/v2.8/me/messages',
		qs: { 
				access_token: token 
			},
		method: 'POST',
		json: messageData

	}, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var recipientId = body.recipient_id;
			var messageId = body.message_id;
			console.log("Message successfuly sent", messageId, recipientId);
			if(typeof fn == "function") fn();
		} else {
			console.error("Unable to sent message.");
			console.error(response);
			console.error(error);
		}
	});  

}
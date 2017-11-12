var AWS = require("aws-sdk");
var moment = require('moment');
var now = moment();

module.exports = function addUser (sender, msgID){

  var docClient = new AWS.DynamoDB.DocumentClient();
  var table = "ChatBotUsers";
  var userID = sender;
	var today = moment().format('YYYYMMDD');
  var params = {
    TableName: table,
    Key: {
        "UsersId": userID
    },
    UpdateExpression: "SET lastMsgSent = :lastmsg, lastInterectionDate = :today",
    ExpressionAttributeValues: { 
        ":lastmsg": msgID,
        ":today" : today
    }
	};

    console.log(msgID);

  docClient.update(params, function(err, data) {
		if (err) {
				console.error("Unable to update/add user. Error JSON:", JSON.stringify(err, null, 2));
		} else {
				console.log("Updated user:" + JSON.stringify(data));
		}
  });
}

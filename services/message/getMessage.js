var AWS = require("aws-sdk");

module.exports = function getMessage(msgID, fn){

  var docClient = new AWS.DynamoDB.DocumentClient();
  var table = "ChatBotMessages";
  var msg = JSON.stringify(msgID.Item.lastMsgSent);
  var params = {
      TableName:table,
      Key:{
          "MessageID": msg
      }
  };

  docClient.get(params, function(err, data) {
      if (err) {
          console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
      } else {
          console.log("Message successfully obtained:", JSON.stringify(data, null, 2));      
          if (typeof fn == 'function') fn(data);
      }
  });
}
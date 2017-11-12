var AWS = require("aws-sdk");

module.exports = function verifyMessage (sender, fn){

  var docClient = new AWS.DynamoDB.DocumentClient();
  var table = "ChatBotUsers";
  var userID = sender;
  var params = {
      TableName:table,
      ProjectionExpression: "lastMsgSent",
      Key:{
          "UsersId": userID
      }
  };

  docClient.get(params, function(err, data) {
      if (err) {
          console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
      } else {
        console.log("'Last message sent' successfully obtained:", JSON.stringify(data, null, 2));      
        if (typeof fn == 'function') fn(sender, data);
      }
  });
}
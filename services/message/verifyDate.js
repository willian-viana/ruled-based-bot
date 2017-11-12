var AWS = require("aws-sdk");
var moment = require('moment');
var now = moment();

module.exports = function verifyDate(sender, fn){
    
    var docClient = new AWS.DynamoDB.DocumentClient();
    var table = "ChatBotUsers";
    var userID = sender;
    var params = {
        TableName:table,
        ProjectionExpression: "lastInterectionDate",
        Key:{
            "UsersId": userID
        }
    };

    docClient.get(params, function(err, data) {
        if (err) {
            console.error("Unable to read item 'lastInterectionDate'. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            // console.log("TESTE X" + JSON.stringify(data));
            if(!data.Item){
                console.log("New user detected.")
                if (typeof fn == 'function') fn(true);
                
            }else{
                var datetime = now.diff(data.Item.lastInterectionDate, 'days');
                if(datetime != 0){
                    console.log("User answered after 24h of interaction");
                    if (typeof fn == 'function') fn(false);  
                }else{
                    console.log("Correct date");
                    if (typeof fn == 'function') fn(true);
                }
            }

            
        }
    });
}
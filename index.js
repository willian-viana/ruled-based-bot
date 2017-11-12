'use strict';
 
// SERVICES
const addUser = require('./services/user/addUser.js');
const sendMessage = require('./services/message/sendMessage.js');
const getMessage = require('./services/message/getMessage.js');
const verifyMessage = require('./services/message/verifyMessage.js');
const CPFValidation = require('./services/user/CPFvalidator.js');
const verifyDate = require('./services/message/verifyDate.js');
const getView = require('./services/webview/getView.js');


// MESSAGES 
const welcomeMessage = 'Oi. Pensando em você criamos esse canal, assim você tem mais uma opção para negociar sua dívida online. 😀\n\nÉ só ir escolhendo as opções oferecidas. Se tiver dúvidas clique em "Atendimento” e fale com a gente.';
const defaultMessage = 'Desculpe, houve algo no meio do caminho, por gentileza envie sua mensagem novamente.';
const cpfMessage = 'Ótimo! Por favor, me mande seu CPF (com 11 dígitos) pra eu ver as oportunidades de negociação que temos pra você.';
const cpfNotFound = 'Ops, não encontramos o seu CPF. Dá uma olhadinha se você digitou os 11 dígitos corretamente.';


// TOKEN PROD
var PAGE_TOKEN = "";
var VERIFY_TOKEN = "";


function sendStructuredMessage(senderFbId, message) {
  var lastMsg = message.Item.MessageID;
  var msgBody = {
    recipient: {
      id: senderFbId
    },
    message: message.Item.Message
  };  

  console.log("Parâmetros: " + senderFbId + ': ' + 
  JSON.stringify(message.Item.Message) + 'Last Msg: ' + lastMsg);
  
  sendMessage(msgBody, PAGE_TOKEN, function(){
    addUser(senderFbId, lastMsg);
  });
}


function sendTextMessage(senderFbId, msg) {
  var msgBody = {
    recipient: {
      id: senderFbId
    },
    message: {
      text: msg ? msg : "Desculpa, não entendi o que você disse."
    },
  };  

  console.log("Enviando mensagem genérica...");

  sendMessage(msgBody, PAGE_TOKEN);
  
}

exports.handler = (event, context, callback) => {
  console.log("EVENT LOG:", JSON.stringify(event));
  // process GET request
  if(event.params && event.params.querystring){
    console.log('GET');
    var queryParams = event.params.querystring;
 
    var rVerifyToken = queryParams['hub.verify_token'];
 
    if (rVerifyToken === VERIFY_TOKEN) {
      var challenge = queryParams['hub.challenge'];
      callback(null, parseInt(challenge));
    }else{
      callback(null, 'Error, wrong validation token');
    }
 
  // process POST request
  } else{
    var messagingEvents = event.entry[0].messaging;
    console.log('MESSAGE LENGTH',messagingEvents.length);
    for (var i = 0; i < messagingEvents.length; i++) {
      var messagingEvent = messagingEvents[i];
      var sender = messagingEvent.sender.id;
      
      if (messagingEvent.message && messagingEvent.message.text && !messagingEvent.message.is_echo) {
       
        var text = messagingEvent.message.text; 

        //Verify date of last message and if it is different of today
        verifyDate(sender, function(date){
          if(!date){
            var data = {"Item": {"lastMsgSent" : 0}};

            console.log("DATA ERRADA");
            sendTextMessage(sender, welcomeMessage);
            
            getMessage(data, function(msg){
              sendStructuredMessage(sender, msg);
            });
          }else{
            verifyMessage(sender, function(id, data){
              if(!data.Item){
                var aux = {"Item": {"lastMsgSent" : 0}};

                sendTextMessage(sender, welcomeMessage);

                getMessage(aux, function(msg){
                    sendStructuredMessage(sender, msg);
                });
              }else{
                switch(data.Item.lastMsgSent) {
                  case "0":
                    var aux = {"Item": {"lastMsgSent" : 0}};
                    
                    console.log("case 0");

                    sendTextMessage(sender, welcomeMessage);
                    
                    getMessage(aux, function(msg){
                        sendStructuredMessage(sender, msg);
                    });
                    break;
                  case "1":
                    console.log("case 1" + text);
                    CPFValidation(text, function(bool){
                      if(bool === true){
                        getView(text, function(msg){
                            if(msg.Item)
                              sendStructuredMessage(sender, msg);
                            else
                              sendTextMessage(sender, msg);
                        });
                      }else{
                        console.log("ENVIANDO MSG GENERIC");
                        sendTextMessage(id, cpfNotFound);
                      } 
                    });
                    break;
                  default:
                    sendTextMessage(id, defaultMessage);
                    addUser(id, '0');
                }
              }
            });

            callback(null, "Done");

          }
        });
        
      } else if (messagingEvent.postback) {
          verifyDate(sender, function(date){
            if(!date){
              var data = {"Item": {"lastMsgSent" : 0}};

              sendTextMessage(sender, welcomeMessage);

              getMessage(data, function(msg){
                sendStructuredMessage(sender, msg);
              });
            }else{
              verifyMessage(messagingEvent.sender.id, function(id, data){
                if(!data.Item){
                  var aux = {"Item": {"lastMsgSent" : 0}}; 

                  sendTextMessage(sender, welcomeMessage);

                  getMessage(aux, function(msg){
                      sendStructuredMessage(id, msg);
                  });
                }else{
                  switch(data.Item.lastMsgSent) {
                    case "0":                        
                      if(messagingEvent.postback.payload == 'checkDebt'){
                        sendTextMessage(id, cpfMessage);
                        addUser(id, "1");
                      }else{
                        var aux = {"Item": {"lastMsgSent" : 0}};
                        sendTextMessage(sender, welcomeMessage);
                        
                        getMessage(aux, function(msg){
                            sendStructuredMessage(sender, msg);
                        });
                      }
                      break;
                    case "1":
                      sendTextMessage(id);
                      break;
                    default:
                      sendTextMessage(id, defaultMessage);
                      addUser(id, '0');
                  }
                }
              });
            }
          });
      }
 
      callback(null, event);
    }
  }


}

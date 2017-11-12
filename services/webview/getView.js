var rp = require('request-promise');

module.exports = function getView(cpf, callback){

  console.log("Chamando View...");
  var fn = function(){};

  if(typeof callback == "function") fn = callback;

  var payloadElement;
  var debtorCpf = cpf.replace(/[^\d]+/g,'');  

  rp('http://localhost:8001/getDebtor/' + debtorCpf)
      .then(function(htmlString) {
          
          console.log("THEN");

          var apiResponse = JSON.parse(htmlString);
          if (apiResponse.errorCode || apiResponse.errorMessage) {
              payloadElement = "Infelizmente, não poderemos te ajudar desta vez! \n\nCaso você tenha uma dívida ou uma negociação já em andamento, favor entrar em contato com o Banco. \n\nCentral de Atendimento Tribanco:\n\n3003 3097\n(Capitais e Regiões Metropolitanas)\nou\n0800 722 3097\n(demais regiões)\n\nDe segunda a sábado, das 8h00 às 20h40."
          

              console.log("Nenhuma oferta encontrada.")
              return fn(payloadElement);
          } else {
              console.log(`Request para API: ${JSON.stringify(apiResponse)}`)
              var debtorName = apiResponse.debtorFullName;
              var debtValue = apiResponse.updatedAmount;
              var debtorDocumentEncoded = new Buffer(apiResponse.document).toString('base64');

              console.log(`Document Encoded: ${debtorDocumentEncoded}`)
              payloadElement = {
                "Item": {
                  "Message": { 
                    "attachment":{
                      "type":"template",
                      "payload":{
                        "template_type": "generic",
                        "elements": [{
                          "title": "👤 Cliente: " + debtorName,
                          "image_url": "",
                          "subtitle": "💵 Dívida atualizada: R$ " + debtValue,
                          "buttons": [{
                              "type": "web_url",
                              "url": "http://localhost:8000/index.html#" + debtorDocumentEncoded,
                              "title": "VER PROPOSTAS!",
                              "webview_height_ratio": "full"
                          }]
                        }]
                      }
                    }
                  }
                }
              };
              console.log("Ofertas encontradas");
              return fn(payloadElement);
          }
      })
      .catch(function(err) {
          console.error(`Erro na Promise do Request para API!`)
      });
}


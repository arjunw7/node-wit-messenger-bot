// 'use strict';
// //developed by Arjun Wadhwa
// //www..github.com/arjunw7/node-wit-messenger-bot
// var bodyParser = require('body-parser');
// var crypto = require('crypto');
// var express = require('express');
// var fetch = require('node-fetch');
// var request = require('request');
// var fs =require('fs');
// var username = null;
// var mongojs = require("mongojs");
// var db = mongojs('mongodb://arjunw7:13bcb0062@ds129038.mlab.com:29038/salesbot', ['sales', 'settlement']);
// var WikiFakt = require('wikifakt');
// var say = require('say');

// let Wit = null;
// let log = null;
// try {
//   // if running from repo
//   Wit = require('../').Wit;
//   log = require('../').log;
// } catch (e) {
//   Wit = require('node-wit').Wit;
//   log = require('node-wit').log;
// }

// // Webserver parameter
// const PORT = process.env.PORT || 8445;

// // Wit.ai parameters
// const WIT_TOKEN = 'TIT545YKEJHN7QB7HJHSTWP34EZSS7YS';

// // Messenger API parameters
// const FB_PAGE_TOKEN = 'EAAFHizhSqiYBAJ5lUkg2RzJznXio8oXSSZCZAP05vhEMwYPrPKbX597ajDZCmTPznaYwcN69MTxkXi5GcSpFXYTjHFrQar4iG2mreE7zWxkUJSdQq0f1RjeVZCZCWptHwySOkbQZByuNnVY6hn9tgZBoZCfE6tj249AMHa6xyhPbuwZDZD';
// if (!FB_PAGE_TOKEN) { throw new Error('missing FB_PAGE_TOKEN') }
// const FB_APP_SECRET = '897f48a01ec53d19d02dfdb55cff0c4f';
// if (!FB_APP_SECRET) { throw new Error('missing FB_APP_SECRET') }

// let FB_VERIFY_TOKEN = 'arjunisawesome';


// const fbMessage = (id, text) => {
//   const body = JSON.stringify({
//     recipient: { id },
//     message: { text },
//   });
//   const qs = 'access_token=' + encodeURIComponent(FB_PAGE_TOKEN);
//   return fetch('https://graph.facebook.com/me/messages?' + qs, {
//     method: 'POST',
//     headers: {'Content-Type': 'application/json'},
//     body
//   })
//   .then(rsp => rsp.json())
//   .then(json => {
//     if (json.error && json.error.message) {
//       throw new Error(json.error.message);
//     }
//     return json;
//   });
// };

// db.settlement.aggregate([{ $group: {_id: "$SalesmanName", value: { $sum: "$CollectedAmount"}}}], function(req, res){
//   console.log(res);
//   var max=0, i=0;
//   for(i=0; i<res.length; i++){
//     if(res[i].value>max){
//       max=res[i].value;
//     }
//   }
//   console.log(max);
// });
// const sessions = {};

// const findOrCreateSession = (fbid) => {
//   let sessionId;
//   // Let's see if we already have a session for the user fbid
//   Object.keys(sessions).forEach(k => {
//     if (sessions[k].fbid === fbid) {
//       // Yep, got it!
//       sessionId = k;
//     }
//   });
//   if (!sessionId) {
//     sessionId = new Date().toISOString();
//     sessions[sessionId] = {fbid: fbid, context: {}};
//   }
//   return sessionId;
// };

// const findSession = (fbid) => {
//   let sessionId;
//   // Let's see if we already have a session for the user fbid
//   Object.keys(sessions).forEach(k => {
//     if (sessions[k].fbid === fbid) {
//       sessionId = k;
//     }
//   });
//   return sessionId;
// };

// var firstEntityValue = (entities, entity) => {
//   var val = entities && entities[entity] &&
//     Array.isArray(entities[entity]) &&
//     entities[entity].length > 0 &&
//     entities[entity][0].value
//   ;
//   if (!val) {
//     return null;
//   }
//   return typeof val === 'object' ? val.value : val;
// };

// // Our bot actions
// const actions = {
//   send({sessionId}, {text}) {
//     // Our bot has something to say!
//     // Let's retrieve the Facebook user whose session belongs to
//     const recipientId = sessions[sessionId].fbid;
//     if (recipientId) {
//       console.log(sessionId);
     
//       return fbMessage(recipientId, text)
//       .then(() => null)
//       .catch((err) => {
//         console.error(
//           'Oops! An error occurred while forwarding the response to',
//           recipientId,
//           ':',
//           err.stack || err
//         );
//       });
//     } else {
//       console.error('Oops! Couldn\'t find user for session:', sessionId);
//       return Promise.resolve()
//     }
//   },
//   merge({sessionId, text, context, entities}) {
//     return new Promise(function(resolve, reject){
//       console.log(entities);
//       var datetime = firstEntityValue(entities, 'datetime');
//       var intent = firstEntityValue(entities, 'intent');
//       var contact = firstEntityValue(entities, 'contact');
//       console.log(intent);
//       console.log(contact);
//       if(intent=="sales"){
//           if(datetime && !contact){
//           var fullDate = entities.datetime[0].value;
//           var year = fullDate.substr(0,4), month = fullDate.substr(5, 2), day = fullDate.substr(8,2);
//           var completeDate = parseInt(year+month+day);
//           console.log(completeDate);
//           db.settlement.aggregate([{ $match: {nDay : completeDate }}, { $group: {_id: "$nDay", value: { $sum: "$CollectedAmount"}}}], function(err, res){
//               console.log(res.length);
//               if(res.length>0){
//               context.revenue = res[0].value;  
//               }
//               else{
//                 context.revenue = 0;
//               }
//               context.maxDate = '06-12-2016';
//               context.username = 'Arjun';
//               delete context.helpReply;
//               delete context.missingDate;
//               delete context.currentIntent;
//               delete context.item;
//               delete context.unknown;
//               delete context.bestSalesman;
//               delete context.introReply;
//               return resolve(context);
//             });
//           }
//           else if(datetime && contact){
//               var fullDate = entities.datetime[0].value;
//               var year = fullDate.substr(0,4), month = fullDate.substr(5, 2), day = fullDate.substr(8,2);
//               var completeDate = parseInt(year+month+day);
//               console.log(completeDate);
//               db.settlement.aggregate([{ $match: {nDay : completeDate, SalesmanName: contact }}, { $group: {_id: "$nDay", value: { $sum: "$CollectedAmount"}}}], function(err, res){
//                   console.log(res.length);
//                   if(res.length>0){
//                   context.revenue = res[0].value;
//                   context.username = 'Arjun';
//                   delete context.missingDate;
//                   delete context.currentIntent;
//                   delete context.item;
//                   delete context.helpReply;
//                   delete context.unknown;
//                   delete context.bestSalesman;
//                   delete context.introReply;
//                   return resolve(context);  
//                   }
//                   else{
//                       db.settlement.aggregate([{ $group: {_id: "$SalesmanName", value: { $sum: "$CollectedAmount"}}}], function(request, response){
//                           var max=0, i=0, name = null;
//                           for(i=0; i<response.length; i++){
//                                 if(response[i].value>max){
//                                   max=response[i].value;
//                                   name=response[i]._id;
//                                 }
//                             }
//                             context.bestSalesman = name;
//                             delete context.missingDate;
//                             delete context.currentIntent;
//                             delete context.item;
//                             delete context.unknown;
//                             delete context.helpReply;
//                             delete context.introReply;
//                             return resolve(context);
//                           });
//                   }
//                 });
//           }
//          else if(!datetime && contact){
//               db.settlement.aggregate([{ $match: {SalesmanName : contact}}, { $group: {_id: "$SalesmanName", value: { $sum: "$CollectedAmount"}}}], function(err, res){
//                   console.log(res.length);
//                   if(res.length>0){
//                   context.revenue = res[0].value;
//                   delete context.missingDate;
//                   delete context.currentIntent;
//                   delete context.item;
//                   delete context.unknown;
//                   delete context.bestSalesman;
//                   delete context.introReply;
//               delete context.helpReply;
//                   return resolve(context);  
//                   }
//                   else{
//                       db.settlement.aggregate([{ $group: {_id: "$SalesmanName", value: { $sum: "$CollectedAmount"}}}], function(request, response){
//                           var max=0, i=0, name = null;
//                           for(i=0; i<response.length; i++){
//                                 if(response[i].value>max){
//                                   max=response[i].value;
//                                   name=response[i]._id;
//                                 }
//                             }
//                             context.bestSalesman = name;
//                             delete context.missingDate;
//                             delete context.currentIntent;
//                             delete context.item;
//                             delete context.unknown;
//                             delete context.introReply;
//                             delete context.helpReply;
//                             return resolve(context);
//                           });
//                   }
//                 });
//           }
//           else{
//               context.missingDate = true;
//               context.currentIntent = 'sales';
//               delete context.revenue;
//               delete context.maxDate;
//               delete context.item;
//               delete context.unknown;
//               delete context.introReply;
//               delete context.helpReply;
//               return resolve(context);
//           }  
//         }
//       else if(intent=='salesman'){
//               var salesman = firstEntityValue(entities, 'salesman');
//               var datetime = firstEntityValue(entities, 'datetime');
//               if(salesman=='outperforming'){
//                 if(datetime){
//                     var fullDate = entities.datetime[0].value;
//                     var year = fullDate.substr(0,4), month = fullDate.substr(5, 2), day = fullDate.substr(8,2);
//                     var completeDate = parseInt(year+month+day);  
//                     db.settlement.aggregate([{ $match: {nDay : completeDate}}, { $group: {_id: "$SalesmanName", value: { $sum: "$CollectedAmount"}}}], function(req, res){
//                         if(res.length>0){
//                           var max=0, i=0, name = null;
//                           for(i=0; i<res.length; i++){
//                             if(res[i].value>max){
//                               max=res[i].value;
//                               name=res[i]._id;
//                             }
//                           }
//                           context.revenue = max;
//                           context.outPerforming = true;
//                           context.value = name;
//                           context.currentIntent = 'salesman';
//                           delete context.helpReply;
//                           return resolve(context);
//                         }
//                         else{
//                           context.notFound = true;
//                           delete context.underPerforming;
//                           return resolve(context);
//                         }
//                       });
//                 }
//                 else{
//                 db.settlement.aggregate([{ $group: {_id: "$SalesmanName", value: { $sum: "$CollectedAmount"}}}], function(req, res){
//                     var max=0, i=0, name = null;
//                     for(i=0; i<res.length; i++){
//                       if(res[i].value>max){
//                         max=res[i].value;
//                         name=res[i]._id;
//                       }
//                     }
//                     context.revenue = max;
//                     context.value = name;
//                     context.outPerforming = true;
//                     delete context.underPerforming; 
//                     delete context.helpReply;
//                     context.currentIntent = 'salesman';
//                     return resolve(context);
//                   });
//                 }
//               }
//               if(salesman=='underperforming'){
//                 if(datetime){
//                     var fullDate = entities.datetime[0].value;
//                     var year = fullDate.substr(0,4), month = fullDate.substr(5, 2), day = fullDate.substr(8,2);
//                     var completeDate = parseInt(year+month+day);  
//                     db.settlement.aggregate([{ $match: {nDay : completeDate}}, { $group: {_id: "$SalesmanName", value: { $sum: "$CollectedAmount"}}}], function(req, res){
//                         if(res.length>0){
//                           var max=1000000000, i=0, name = null;
//                           for(i=0; i<res.length; i++){
//                             if(res[i].value<max){
//                               max=res[i].value;
//                               name=res[i]._id;
//                             }
//                           }
//                           context.revenue = max;
//                           context.value = name;
//                           context.underPerforming = true;
//                           context.currentIntent = 'salesman';
//                           delete context.outPerforming;
//                           return resolve(context);                          
//                         }
//                         else{
//                           context.notFound = true;
//                           return resolve(context);
//                         }
//                       });
//                 }
//                 else{
//                 db.settlement.aggregate([{ $group: {_id: "$SalesmanName", value: { $sum: "$CollectedAmount"}}}], function(req, res){
//                     var max=10000000000, i=0, name = null;
//                     for(i=0; i<res.length; i++){
//                       if(res[i].value<max){
//                         max=res[i].value;
//                         name=res[i]._id;
//                       }
//                     }
//                     context.revenue = max;
//                     context.value = name;
//                     context.underPerforming = true;
//                     context.currentIntent = 'salesman';
//                     delete context.outPerforming;
//                     return resolve(context);
//                   });
//                 }
//               }     
//       }
//       else if(context.currentIntent=='sales' && datetime){
//             context.revenue = 2512453;
//             context.maxDate = '06-12-2016';
//             context.username = 'Arjun';
//             delete context.helpReply;
//             delete context.introReply;
//             return resolve(context);
               
//       }
//       else if(context.currentIntent=='salesman' && context.underPerforming && intent=='moreDetail'){
//             context.clientsNum = 89;
//             context.rating = 2.9;
//             return resolve(context);
//       }
      
//       else if(context.currentIntent=='salesman' && context.outPerforming && intent=='moreDetail'){
//             context.clientsNum = 143;
//             context.rating = 4.5;
//             console.log('yay');
//             return resolve(context);
//       }

//       else if(context.currentIntent=='salesman' && context.outPerforming && intent=='extraDetails'){
//             context.second = 'Gaurav';
//             context.third = 'Sachin';
//             context.secondSales = 675632;
//             context.thirdSales = 642972;
//             return resolve(context);
//       }
//       else if(context.currentIntent=='salesman' && context.underPerforming && intent=='extraDetails'){
//             context.second = 'Chetan';
//             context.third = 'Rachana';
//             context.secondSales = 388043;
//             context.thirdSales = 547443;
//             console.log('yay');
//             return resolve(context);
//       }
//       else if(intent=='fact'){
//                 WikiFakt.getRandomFact().then(function(item) {
//                 context.item = item;
//                 delete context.revenue;
//                 delete context.maxDate;
//                 delete context.missingDate;
//                 delete context.unknown;
//                 delete context.introReply;
//                 context.currentIntent = 'fact';
//                 return resolve(context);
//                 });
//           }
//       else if(intent=='introduction'){
//                 context.introReply=true;
//                 context.username = 'Arjun';
//                 delete context.revenue;
//                 delete context.maxDate;
//                 delete context.missingDate;
//                 delete context.unknown;
//                 delete context.helpReply;
//                 delete context.underPerforming;
//                 delete context.outPerforming;
//                 return resolve(context);
//       }
//       else if(!intent && contact){
//             context.unknown = true;
//             delete context.revenue;
//             delete context.maxDate;
//             delete context.missingDate;
//             delete context.unknown;
//             delete context.introReply;
//             delete context.helpReply;
//             delete context.underPerforming;
//             delete context.outPerforming;
//             return resolve(context);
//       }

//       else if(intent=='bestBrand'){
//             context.brandName = 'Adidas';
//             context.units = 685;
//             context.revenue = 2586856;
//             delete context.maxDate;
//             delete context.missingDate;
//             delete context.unknown;
//             delete context.introReply;
//             delete context.helpReply;
//             return resolve(context);
//       }
//       else if(intent=='help'){
//         context.helpReply = true;
//         return resolve(context);
//       }
//       else if(intent=='growthRate'){
//             context.negativeRate = '22.67';
//             delete context.revenue;
//             delete context.maxDate;
//             delete context.missingDate;
//             delete context.unknown;
//             delete context.introReply;
//             delete context.helpReply;
//             delete context.underPerforming;
//             delete context.outPerforming;
//             return resolve(context);
//       }
//       else if(intent=='bestDepartment'){
//             context.departmentName = 'Cosmetics';
//             context.units = 1015;
//             context.revenue = 935120;
//             delete context.maxDate;
//             delete context.missingDate;
//             delete context.unknown;
//             delete context.introReply;
//            delete context.helpReply;
//             delete context.underPerforming;
//             delete context.outPerforming;
//             return resolve(context);
//       }
//       else if(intent=='uniqueVisitors'){
//             context.uniqueVisitors = 143;
//             delete context.departmentName;
//             delete context.units;
//             delete context.revenue;
//             delete context.maxDate;
//             delete context.missingDate;
//             delete context.unknown;
//             delete context.introReply;
//             delete context.helpReply; 
//             delete context.underPerforming;
//             delete context.outPerforming;
//             return resolve(context);
//       }
//       else if(intent=='paymentMode'){
//             context.uniqueVisitors = 143;
//             delete context.departmentName;
//             delete context.units;
//             delete context.revenue;
//             delete context.maxDate;
//             delete context.missingDate;
//             delete context.unknown;
//             delete context.introReply;
//             delete context.helpReply;
//             delete context.underPerforming;
//             delete context.outPerforming;
//             return resolve(context);
//       }
//       else if(intent=='hniClients'){
//         context.clientNum = 102;
//         contexts.revenue = 201502.99;
//         context.units = 7450;
//         return resolve(context);
//       }
//       else if(intent=='uniqueVisitors'){
//         context.uniqueVisitors = 861;
//         return resolve(context);
//       }
//       else if(intent=='overview'){
//         if(datetime){
//           context.revenue = 968566;
//           context.units = 265;
//           context.datePresent = datetime;
//           return resolve(context);
//         }
//         else{
//           context.revenue = 2658453;
//           context.units = 25651;
//           context.missingDate = true;
//           context.mom  = 1.3;
//           context.currentIntent = 'overview';
//           return resolve(context);
//         }
//       }
//       else if(intent=='overview' && contact){
//         if(datetime){
//           context.revenue = 968566;
//           context.units = 265;
//           context.datePresent = datetime;
//           return resolve(context);
//         }
//         else{
//           context.revenue = 2658453;
//           context.units = 25651;
//           context.missingDate = true;
//           context.mom  = 1.3;
//           context.currentIntent = 'overview';
//           return resolve(context);
//         }
//       }
//       else if(context.currentIntent=='overview' && datetime){
//           context.revenue = 968566;
//           context.units = 265;
//           context.datePresent = datetime;
//           return resolve(context);        
//       }
//       else if(intent=='conclusion'){
//             context.username = 'Arjun';
//             context.conclusionReply = true;
//             delete context.item;
//             delete context.revenue;
//             delete context.maxDate;
//             delete context.missingDate;
//             delete context.currentIntent;
//             delete context.underPerforming;
//             delete context.outPerforming;
//             delete context.introReply;
//             delete context.helpReply;
//             delete context.unknown;
//             return resolve(context);
//       }
//       else{
//           context.unknown = true;
//           delete context.item;
//           delete context.revenue;
//           delete context.maxDate;
//           delete context.missingDate;
//           delete context.currentIntent;
//           delete context.introReply;
//           return resolve(context);
//       }
//     })
//   },
//   emptyContext({context}){
//               delete context.item;
//               delete context.revenue;
//               delete context.maxDate;
//               delete context.missingDate;
//               delete context.currentIntent;
//               delete context.underPerforming;
//               delete context.outPerforming;
//               delete context.introReply;
//               delete context.helpReply;    
//   }
// };

// var sender = null;
// // Setting up our bot
// const wit = new Wit({
//   accessToken: WIT_TOKEN,
//   actions,
//   logger: new log.Logger(log.INFO)
// });

// // Starting our webserver and putting it all together
// const app = express();
// app.use(({method, url}, rsp, next) => {
//   rsp.on('finish', () => {
//     console.log(`${rsp.statusCode} ${method} ${url}`);
//   });
//   next();
// });

// app.use(bodyParser.json({ verify: verifyRequestSignature }));

// app.set('views', __dirname + '/views');
// app.use(express.static('public'));
// // Render homepage (note trailing slash): example.com/
// app.get('/', function(request, response) {
//   var data = fs.readFileSync('index.html').toString();
//   response.send(data);
// });
// // Webhook setup
// app.get('/webhook', (req, res) => {
//   if (req.query['hub.mode'] === 'subscribe' &&
//     req.query['hub.verify_token'] === FB_VERIFY_TOKEN) {
//     res.send(req.query['hub.challenge']);
//   } else {
//     res.sendStatus(400);
//   }
// });

// // Message handler
// app.post('/webhook', (req, res) => {
//   const data = req.body;
//   if (data.object === 'page') {
//     data.entry.forEach(entry => {
//       entry.messaging.forEach(event => {
//         if (event.message && !event.message.is_echo) {
//           // Yay! We got a new message!
//           // We retrieve the Facebook user ID of the sender
//           sender = event.sender.id;
//             // if(!findSession(sender)){
//             //       var fburl ="https://graph.facebook.com/v2.6/" + sender + "?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=" + FB_PAGE_TOKEN;
//             //       request(fburl, (error, response, body)=> {
//             //         if (!error && response.statusCode === 200) {
//             //           const fbResponse = JSON.parse(body);
//             //           console.log(fbResponse);
//             //           username = fbResponse.first_name;
//             //           fbMessage(sender, "Welcome to RealBot!\n\nsender.first_Name: " + fbResponse.first_name + "\nsender.last_name: " + fbResponse.last_name + "\nsender.gender: " + fbResponse.gender + "\nsender.timezone: " + fbResponse.timezone)
//             //       .catch(console.error);
//             //         } else {
//             //           console.log("Got an error: ", error, ", status code: ", response.statusCode);
//             //         }
//             //       });
                    
//             // }
//           // We retrieve the user's current session, or create one if it doesn't exist
//           // This is needed for our bot to figure out the conversation history
//           const sessionId = findOrCreateSession(sender);

//           // We retrieve the message content
//           const {text, attachments} = event.message;

//           if (attachments) {
//             // We received an attachment
//             // Let's reply with an automatic message
//             fbMessage(sender, 'Sorry I can only process text messages for now.')
//             .catch(console.error);
//           } else if (text) {
//             // We received a text message

//             // Let's forward the message to the Wit.ai Bot Engine
//             // This will run all actions until our bot has nothing left to do
//             wit.runActions(
//               sessionId, // the user's current session
//               text, // the user's message
//               sessions[sessionId].context // the user's current session state
//             ).then((context) => {
//               // Our bot did everything it has to do.
//               // Now it's waiting for further messages to proceed.
//               console.log('Waiting for next user messages');
//               sessions[sessionId].context = context;
//             })
//             .catch((err) => {
//               console.error('Oops! Got an error from Wit: ', err.stack || err);
//             })
//           }
//         } else {
//           console.log('received event', JSON.stringify(event));
//           // if(event){
//           //     say.speak(event.message.text);
//           // }
//           }
//       });
//     });
//   }
//   res.sendStatus(200);
// });


// function verifyRequestSignature(req, res, buf) {
//   var signature = req.headers["x-hub-signature"];

//   if (!signature) {
//     // For testing, let's log an error. In production, you should throw an
//     // error.
//     console.error("Couldn't validate the signature.");
//   } else {
//     var elements = signature.split('=');
//     var method = elements[0];
//     var signatureHash = elements[1];

//     var expectedHash = crypto.createHmac('sha1', FB_APP_SECRET)
//                         .update(buf)
//                         .digest('hex');

//     if (signatureHash != expectedHash) {
//       throw new Error("Couldn't validate the request signature.");
//     }
//   }
// }

// app.listen(PORT);
// console.log('Listening on :' + PORT + '...');


'use strict';
//developed by Arjun Wadhwa
//www..github.com/arjunw7/node-wit-messenger-bot
var bodyParser = require('body-parser');
var crypto = require('crypto');
var express = require('express');
var fetch = require('node-fetch');
var request = require('request');
var fs =require('fs');
var username = null;
var mongojs = require("mongojs");
var db = mongojs('mongodb://arjunw7:13bcb0062@ds129038.mlab.com:29038/salesbot', ['sales', 'settlement']);
var WikiFakt = require('wikifakt');
var say = require('say');

let Wit = null;
let log = null;
try {
  // if running from repo
  Wit = require('../').Wit;
  log = require('../').log;
} catch (e) {
  Wit = require('node-wit').Wit;
  log = require('node-wit').log;
}

// Webserver parameter
const PORT = process.env.PORT || 8445;

// Wit.ai parameters
const WIT_TOKEN = 'JXOQBW75E7H6COQ5UJO4YMIHAP6JRLEJ';

// Messenger API parameters
const FB_PAGE_TOKEN = 'EAAFHizhSqiYBAJ5lUkg2RzJznXio8oXSSZCZAP05vhEMwYPrPKbX597ajDZCmTPznaYwcN69MTxkXi5GcSpFXYTjHFrQar4iG2mreE7zWxkUJSdQq0f1RjeVZCZCWptHwySOkbQZByuNnVY6hn9tgZBoZCfE6tj249AMHa6xyhPbuwZDZD';
if (!FB_PAGE_TOKEN) { throw new Error('missing FB_PAGE_TOKEN') }
const FB_APP_SECRET = '897f48a01ec53d19d02dfdb55cff0c4f';
if (!FB_APP_SECRET) { throw new Error('missing FB_APP_SECRET') }

let FB_VERIFY_TOKEN = 'arjunisawesome';


const fbMessage = (id, text) => {
  const body = JSON.stringify({
    recipient: { id },
    message: { text },
  });
  const qs = 'access_token=' + encodeURIComponent(FB_PAGE_TOKEN);
  return fetch('https://graph.facebook.com/me/messages?' + qs, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body
  })
  .then(rsp => rsp.json())
  .then(json => {
    if (json.error && json.error.message) {
      throw new Error(json.error.message);
    }
    return json;
  });
};

db.settlement.aggregate([{ $group: {_id: "$SalesmanName", value: { $sum: "$CollectedAmount"}}}], function(req, res){
  console.log(res);
  var max=0, i=0;
  for(i=0; i<res.length; i++){
    if(res[i].value>max){
      max=res[i].value;
    }
  }
  console.log(max);
});
const sessions = {};

const findOrCreateSession = (fbid) => {
  let sessionId;
  // Let's see if we already have a session for the user fbid
  Object.keys(sessions).forEach(k => {
    if (sessions[k].fbid === fbid) {
      // Yep, got it!
      sessionId = k;
    }
  });
  if (!sessionId) {
    sessionId = new Date().toISOString();
    sessions[sessionId] = {fbid: fbid, context: {}};
  }
  return sessionId;
};

const findSession = (fbid) => {
  let sessionId;
  // Let's see if we already have a session for the user fbid
  Object.keys(sessions).forEach(k => {
    if (sessions[k].fbid === fbid) {
      sessionId = k;
    }
  });
  return sessionId;
};

var firstEntityValue = (entities, entity) => {
  var val = entities && entities[entity] &&
    Array.isArray(entities[entity]) &&
    entities[entity].length > 0 &&
    entities[entity][0].value
  ;
  if (!val) {
    return null;
  }
  return typeof val === 'object' ? val.value : val;
};

// Our bot actions
const actions = {
  send({sessionId}, {text}) {
    // Our bot has something to say!
    // Let's retrieve the Facebook user whose session belongs to
    const recipientId = sessions[sessionId].fbid;
    if (recipientId) {
      console.log(sessionId);
     
      return fbMessage(recipientId, text)
      .then(() => null)
      .catch((err) => {
        console.error(
          'Oops! An error occurred while forwarding the response to',
          recipientId,
          ':',
          err.stack || err
        );
      });
    } else {
      console.error('Oops! Couldn\'t find user for session:', sessionId);
      return Promise.resolve()
    }
  },
  merge({sessionId, text, context, entities}) {
    return new Promise(function(resolve, reject){
      console.log(entities);
      var roomID = firstEntityValue(entities, 'roomID');
      console.log(roomID);
      context.directions = "Go straight, second room on the left is Berners";
      return resolve(context);
  }
};

var sender = null;
// Setting up our bot
const wit = new Wit({
  accessToken: WIT_TOKEN,
  actions,
  logger: new log.Logger(log.INFO)
});

// Starting our webserver and putting it all together
const app = express();
app.use(({method, url}, rsp, next) => {
  rsp.on('finish', () => {
    console.log(`${rsp.statusCode} ${method} ${url}`);
  });
  next();
});

app.use(bodyParser.json({ verify: verifyRequestSignature }));

app.set('views', __dirname + '/views');
app.use(express.static('public'));
// Render homepage (note trailing slash): example.com/
app.get('/', function(request, response) {
  var data = fs.readFileSync('index.html').toString();
  response.send(data);
});
// Webhook setup
app.get('/webhook', (req, res) => {
  if (req.query['hub.mode'] === 'subscribe' &&
    req.query['hub.verify_token'] === FB_VERIFY_TOKEN) {
    res.send(req.query['hub.challenge']);
  } else {
    res.sendStatus(400);
  }
});

// Message handler
app.post('/webhook', (req, res) => {
  const data = req.body;
  if (data.object === 'page') {
    data.entry.forEach(entry => {
      entry.messaging.forEach(event => {
        if (event.message && !event.message.is_echo) {
          // Yay! We got a new message!
          // We retrieve the Facebook user ID of the sender
          sender = event.sender.id;
            // if(!findSession(sender)){
            //       var fburl ="https://graph.facebook.com/v2.6/" + sender + "?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=" + FB_PAGE_TOKEN;
            //       request(fburl, (error, response, body)=> {
            //         if (!error && response.statusCode === 200) {
            //           const fbResponse = JSON.parse(body);
            //           console.log(fbResponse);
            //           username = fbResponse.first_name;
            //           fbMessage(sender, "Welcome to RealBot!\n\nsender.first_Name: " + fbResponse.first_name + "\nsender.last_name: " + fbResponse.last_name + "\nsender.gender: " + fbResponse.gender + "\nsender.timezone: " + fbResponse.timezone)
            //       .catch(console.error);
            //         } else {
            //           console.log("Got an error: ", error, ", status code: ", response.statusCode);
            //         }
            //       });
                    
            // }
          // We retrieve the user's current session, or create one if it doesn't exist
          // This is needed for our bot to figure out the conversation history
          const sessionId = findOrCreateSession(sender);

          // We retrieve the message content
          const {text, attachments} = event.message;

          if (attachments) {
            // We received an attachment
            // Let's reply with an automatic message
            fbMessage(sender, 'Sorry I can only process text messages for now.')
            .catch(console.error);
          } else if (text) {
            // We received a text message

            // Let's forward the message to the Wit.ai Bot Engine
            // This will run all actions until our bot has nothing left to do
            wit.runActions(
              sessionId, // the user's current session
              text, // the user's message
              sessions[sessionId].context // the user's current session state
            ).then((context) => {
              // Our bot did everything it has to do.
              // Now it's waiting for further messages to proceed.
              console.log('Waiting for next user messages');
              sessions[sessionId].context = context;
            })
            .catch((err) => {
              console.error('Oops! Got an error from Wit: ', err.stack || err);
            })
          }
        } else {
          console.log('received event', JSON.stringify(event));
          // if(event){
          //     say.speak(event.message.text);
          // }
          }
      });
    });
  }
  res.sendStatus(200);
});


function verifyRequestSignature(req, res, buf) {
  var signature = req.headers["x-hub-signature"];

  if (!signature) {
    // For testing, let's log an error. In production, you should throw an
    // error.
    console.error("Couldn't validate the signature.");
  } else {
    var elements = signature.split('=');
    var method = elements[0];
    var signatureHash = elements[1];

    var expectedHash = crypto.createHmac('sha1', FB_APP_SECRET)
                        .update(buf)
                        .digest('hex');

    if (signatureHash != expectedHash) {
      throw new Error("Couldn't validate the request signature.");
    }
  }
}

app.listen(PORT);
console.log('Listening on :' + PORT + '...');


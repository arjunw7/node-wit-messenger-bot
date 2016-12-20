'use strict';
//developed by Arjun Wadhwa
//www..github.com/arjunw7/node-wit-messenger-bot
var bodyParser = require('body-parser');
var crypto = require('crypto');
var express = require('express');
var fetch = require('node-fetch');
var request = require('request');
var fs =require('fs');

var mongojs = require("mongojs");
var db = mongojs('mongodb://arjunw7:13bcb0062@ds129038.mlab.com:29038/salesbot', ['sales', 'settlement']);
var WikiFakt = require('wikifakt');

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
const WIT_TOKEN = 'TIT545YKEJHN7QB7HJHSTWP34EZSS7YS';

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
      var datetime = firstEntityValue(entities, 'datetime');
      var score = firstEntityValue(entities, 'score');
      var intent = firstEntityValue(entities, 'intent');
      
      if(entities.intent[0].value=='sales'){
          if(datetime){
          var totalSales;
          var fullDate = entities.datetime[0].value;
          var year = fullDate.substr(0,4), month = fullDate.substr(5, 2), day = fullDate.substr(8,2);
          var completeDate = parseInt(year+month+day);
          console.log(completeDate);
          db.settlement.aggregate([{ $match: {nDay : completeDate }}, { $group: {_id: "$nDay", total: { $sum: "$CollectedAmount"}}}], function(err, res){
              context.unitsSold = res[0].total;
              context.maxDate = '06-12-2016';
              return resolve(context);
            });
          }
          else{
              context.missingDate = true;
              context.currentIntent = 'sales';
              return resolve(context);
          }  
        }
      else if(datetime && context.currentIntent=='sales'){
        var datetime = firstEntityValue(entities, 'datetime');
        if(datetime){
          var totalSales;
          var fullDate = entities.datetime[0].value;
          var year = fullDate.substr(0,4), month = fullDate.substr(5, 2), day = fullDate.substr(8,2);
          var completeDate = parseInt(year+month+day);
          console.log(completeDate);
          db.settlement.aggregate([{ $match: {nDay : completeDate }}, { $group: {_id: "$nDay", total: { $sum: "$CollectedAmount"}}}], function(err, res){
              context.unitsSold = res[0].total;
              context.maxDate = '06-12-2016';
              delete context.missingDate;
              delete context.currentIntent;
              delete context.item;
              return resolve(context);
            });
        }
      }
      else if(entities.intent[0].value=='fact'){
                WikiFakt.getRandomFact().then(function(item) {
                context.item = item;
                delete context.unitsSold;
                delete context.maxDate;
                delete context.missingDate;
                context.currentIntent = 'fact';
                return resolve(context);
                });
          }
      
      else if(score){
                context.score = "this is score";
                delete context.item;
                delete context.unitsSold;
                delete context.maxDate;
                delete context.missingDate;
                context.currentIntent = 'score';  
                return resolve(context);
      }

      else{
          context.unknown = true;
          return resolve(context);
      }
    })
  },
  emptyContext({context}){
              delete context.score;
              delete context.item;
              delete context.unitsSold;
              delete context.maxDate;
              delete context.missingDate;
              delete context.currentIntent;  
                
  }
};

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
          const sender = event.sender.id;
            if(!findSession(sender)){
                  fbMessage(sender, "Welcome to RealBot!")
                  .catch(console.error);    
            }
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

              // Based on the session state, you might want to reset the session.
              // This depends heavily on the business logic of your bot.
              // Example:
              // if (context['done']) {
              //   delete sessions[sessionId];
              // }

              // Updating the user's current session state
              sessions[sessionId].context = context;
            })
            .catch((err) => {
              console.error('Oops! Got an error from Wit: ', err.stack || err);
            })
          }
        } else {
          console.log('received event', JSON.stringify(event));
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

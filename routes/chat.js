const fs = require('firebase-admin');
const express = require('express');
const router = express.Router();
const serviceAccount = require('../csci5410-334019-bc502d4d7f64_service_account_gurleen.json');
const publisher = require('../publisher')
const subscriber = require('../subscriber')
const db = fs.firestore();
fs.app()

router.get('/chat/:email/:boxid', (req, res, next) => {
    console.log("Begin execution");
    (async () => {
      await db.collection('userdata').where('boxid', '==', req.params.boxid)
      .get().then((details) => {
          const onlineUsers = [];
          let i = 0;
          details.forEach(element => {
              if(element.data().email != req.params.email){
                onlineUsers[i] = element.data().email;
                ++i;
              }
          });
          var response = {
            'message': "User retrieved successfully.",
            'status': true,
            'data': onlineUsers
          };
          console.log(response);
          res.status(200).json(response);
      });
    })();
  });
  
  router.post('/chats', (req, res, next) => {
    console.log("Calling publisher")
    console.log(publisher)
    console.log(req.body.subscription)
    data = JSON.stringify({"sender": req.body.sender, "body": req.body.chatmessage, "receiver": req.body.receiver})
    console.log(data)
    publisher.publishMessageWithCustomAttributes(data, req.body.subscription).catch(console.error);
  });
  
  router.post('/', (req, res, next) => {
    console.log("Calling subscriber")
    console.log(subscriber)
    console.log(req.body.email)
    subscriber.listenForMessages(req.body.email).then((message) => {
      console.log(message)
      extractedMessages = [];
      message.forEach(messageValue => {
        console.log(messageValue.body)
        extractedMessages.push(messageValue.body);
      })
      var response = {
        'message': 'New message received!',
        'status': true,
        'data': extractedMessages
      }
      console.log(response);
      res.status(200).json(response);
    });
  });

  module.exports = router;
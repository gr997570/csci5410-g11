const fs = require('firebase-admin');
const express = require('express');
const router = express.Router();
const serviceAccount = require('../csci5410-334019-bc502d4d7f64_service_account_gurleen.json');
const passwordHash = require('password-hash');
const https = require('https')
fs.initializeApp({
 credential: fs.credential.cert(serviceAccount)
});
const db = fs.firestore();

router.post('/register', (req, res, next) => {
  //res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
  console.log("Request received");
    if(Object.keys(req.body).length > 0) {
      console.log(req.body);
        // if(req.body.id){
        //   return res.status(400).json({
        //     message: "Id not required. It will be auto-generated.",
        //     success: false,
        //   });
        // }
        jsonObj = {
          "email": "",
          "name": "",
          "password": "",
          "boxid": "",
          "boxuserid": "",
        };
        validateUserCredential(req, jsonObj);
        if(!isBodyValid){
          return res.status(400).json({
            message: "JSON value is empty.",
            success: false,
          });
        }
        (async function() {
          await db.collection('userdata').where('email', '==', req.body.email).get().then((user) => {
            if(user.size > 0){
              return res.status(500).json({
                message: "User already exists",
                success: true,
              });
            }
            else{
              db.collection('userdata').where('boxid', '==', req.body.boxid).get().then((output) => {
                if(output.size < 3){
                  jsonObj.boxuserid = output.size+1;
                  db.collection("userdata").doc(req.body.email).set(jsonObj).then(()=>{
                    innerJsonObj = {
                      email: req.body.email,
                      question: req.body.question,
                      answer: req.body.answer
                    }
                    db.collection("securityquestions").doc(req.body.email).set(innerJsonObj).then(()=>{
                      console.log("Written to database")
                    });
                  });
                  return res.status(201).json({
                    message: "User registered",
                    success: true,
                  });
                }
                else{
                  return res.status(401).json({
                    message: "Cannot assign user to this box",
                    success: true,
                  });
                }
              });
            }
        });
      })();
      }
      else{
        return res.status(400).json({
          message: "Request Body is empty.",
          success: false,
        });
      }
});

function validateUserCredential(req, jsonObj){
    if(req.body.name != undefined && req.body.name !== ''){
      isBodyValid = true;
      jsonObj.name = req.body.name;
    }
    else if (req.body.name === ''){
      isBodyValid = false;
      return;
    }
    if(req.body.email != undefined && req.body.email !== ''){
      jsonObj.email = req.body.email;
      isBodyValid = true;
    }
    else if (req.body.email === ''){
      isBodyValid = false;
      return;
    }
    if(req.body.password != undefined && req.body.password !== ''){
      jsonObj.password = passwordHash.generate(req.body.password);
      isBodyValid = true;
    }
    else if (req.body.password === ''){
      isBodyValid = false;
      return;
    }
    if(req.body.boxid != undefined && req.body.boxid !== ''){
      jsonObj.boxid = req.body.boxid;
      isBodyValid = true;
    }
    else if (req.body.boxid === ''){
      isBodyValid = false;
      return;
    }
  }

  router.post('/secondfactor', (req, res, next) => {
    if(Object.keys(req.body).length > 0) {
      securityJsonObj = {
        "question": "",
        "answer": "",
      };
      validateSecondFactor(req, securityJsonObj);
      if(!isBodyValid){
        return res.status(400).json({
          message: "JSON value is empty.",
          success: false,
        });
      }
      db.collection("securityquestions")
        .where('email', '==', req.body.email)
        .where('question', '==', req.body.question)
        .where('answer', '==', req.body.answer).get().then((output) => {
          if(output.size > 0){
            return res.status(200).json({
              message: "Second factor validated",
              success: true,
            });
          }
          else{
            return res.status(500).json({
              message: "Second factor invalid",
              success: true,
            });
          }
        });
    }
  });

  function validateSecondFactor(req, jsonObj){
    if(req.body.question != undefined && req.body.question !== ''){
      isBodyValid = true;
      jsonObj.question = req.body.question;
    }
    else if (req.body.question === ''){
      isBodyValid = false;
      return;
    }
    if(req.body.answer != undefined && req.body.answer !== ''){
      jsonObj.answer = req.body.answer;
      isBodyValid = true;
    }
    else if (req.body.answer === ''){
      isBodyValid = false;
      return;
    }
  }

  router.post('/thirdfactor', (req, res, next) => {
        cipherList = ["Train", "February","christmas", "tiger", "Canada","Mumbai", "India", "Station", "mobile"];
        random = Math.floor(Math.random() * cipherList.length);
        let correctAnswer = '';

        const request = https.get('https://y090bzc1m1.execute-api.us-east-1.amazonaws.com/test2?userinput='+cipherList[random], function(resp) {
          resp.on('data', chunk => {
            correctAnswer += chunk;
          });
          resp.on('end', () => {
            correctAnswer = JSON.parse(correctAnswer);
            console.log(correctAnswer["correctAnswer"]);
            let cipher = {
              cipherValue: cipherList[random],
              cipherAnswer: correctAnswer["correctAnswer"]
            }
    
            var response = {
                'message': "Cipher validation successful.",
                'status': true,
                'data': cipher
            };
            console.log(response);
            res.status(200).json(response);
          });
        });

        request.on('error', (e) => {
          console.error(e);
        });
  });

  function validateThirdFactor(req, jsonObj){
    if(req.body.answer != undefined && req.body.answer !== ''){
      jsonObj.answer = req.body.answer;
      isBodyValid = true;
    }
    else if (req.body.answer === ''){
      isBodyValid = false;
      return;
    }
  }

router.post('/login', (req, res, next) => {
    console.log(req.body.email);
    console.log(req.body.password);
    jsonObj = {
        "email": req.body.email,
        "timestamp": Date.now(),
        "status": true
    };
    (async function() {
        await db.collection('userdata').doc(req.body.email)
        .get().then(function(details) {
          if(details.data() === undefined){
            return res.status(401).json({
              'message': 'User not registered',
              'status': false
            });
          }
          else{
            console.log(req.body.password);
              if(passwordHash.verify(req.body.password, details.data().password)){
                  var response = {
                      'message': "User retrieved successfully.",
                      'status': true,
                      'data': details.data()
                  };
                  (async function() {
                      await db.collection('userlogindetails').doc(req.body.email).set(jsonObj);
                      res.status(200).json(response);
                  })();
              }
              else{
                  return res.status(401).json({
                      'message': 'Authorization failed',
                      'status': false
                  });
              }
          }
        });
    })();
});

module.exports = router;
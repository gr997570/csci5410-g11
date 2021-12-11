const express = require("express");
const router = express.Router();
const uploadImage = require('./uploadhelper')
const fs = require('firebase-admin');
const serviceAccount = require('../csci5410-334019-bc502d4d7f64_service_account_gurleen.json');
const { v4: uuidv4 } = require('uuid');
// fs.initializeApp({
//  credential: fs.credential.cert(serviceAccount)
// });
fs.app();
const db = fs.firestore();

router.post('/upload', (req, res, next) => {
    const myFile = req.file;
    sender = req.body.sender;
    (async () => {
        await uploadImage.uploadImage(sender, myFile).then((imageLabel) => {
            console.log(imageLabel);
            jsonObj = {
                "email": req.body.sender,
                "label":imageLabel
            };
            db.collection('images').doc(uuidv4()).set(jsonObj);
            (async () => {
                await db.collection('images').where('email', '==', req.body.receiver).where('label', '==', imageLabel)
                .get().then(() => {
                    res.status(201).json({
                        message: "Upload was successful and image found",
                        status: true
                    })
                });
            });
        })
    })().catch (error => {
        console.log(error);
        res.status(500).json({
            message: 'Internal server error!',
        })
    });
});

module.exports = router;
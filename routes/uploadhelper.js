const cloud = require('@google-cloud/storage')
const serviceKey = "./csci5410-334019-fdebd0e47198_fileupload.json"
const { Storage } = cloud
const storage = new Storage({
  keyFilename: serviceKey,
  projectId: 'csci5410-334019',
});
const bucket = storage.bucket('safedeposit') // should be your bucket name
const {format} = require('util');
const vision = require('@google-cloud/vision');
const {PredictionServiceClient} = require('@google-cloud/automl').v1;
const clientPred = new PredictionServiceClient();
const client = new vision.ImageAnnotatorClient();
var stream = require('stream');

/**
 *
 * @param { File } object file object that will be uploaded
 * @description - This function does the following
 * - It uploads a file to the image bucket on Google Cloud
 * - It accepts an object as an argument with the
 *   "originalname" and "buffer" as keys
 */

function ifFileExists(sender, file){
    const blob = bucket.file(sender+"/"+file.originalname);
    console.log(blob.exists())
    //stats = storage.Blob(bucket=bucket, name=user+"/"+file.originalname).exists(storage_client)
}

function uploadImage(sender, file) {
    console.log("inside uploadImage")
    //const { originalname, buffer } = file

    const blob = bucket.file(sender+"/"+file.originalname);
    const blobStream = blob.createWriteStream();

    blobStream.on('error', err => {
        console.log(err)
    });

    blobStream.on('finish', () => {
        // The public URL can be used to directly access the file via HTTP.
        const publicUrl = format(
        `https://storage.googleapis.com/${bucket.name}/${blob.name}`
        );
    });

    blobStream.end(file.buffer);

    return new Promise(function(resolve){
        setTimeout(() => {
            imageLabel = classifyImage(format(
                `https://storage.googleapis.com/${bucket.name}/${blob.name}`
                ))
            console.log(imageLabel)
            resolve(imageLabel)
        }, 5000)
    });
}

function classifyImage(publicUrl){
    const request = {
            "image":{
                "source":{
                "imageUri":publicUrl
            }
        },
        "features":[
            {
                "type":"LABEL_DETECTION",
                "maxResults":1
            }
        ]
    }
    console.log(request)
    const imageLabel = client.annotateImage(request).then(res2=>{
        console.log(res2)
          console.log(res2[0]['labelAnnotations'][0]['description']);
          return res2[0]['labelAnnotations'][0]['description'];
        //   var score= res2[0]['labelAnnotations'][0]['score'];
        //   if(score < 0.97) {
        //       return false
        //   }
        //   else {
        //       return true
        //   }
        });
        return imageLabel;
}

//     const blob = bucket.file(originalname.replace(/ /g, "_"))
//     const blobStream = blob.createWriteStream({
//         resumable: false
//     })
//     blobStream.on('finish', () => {
//         console.log(bucket.name)
//         console.log(blob.name)
//         const publicUrl = format(
//         `https://storage.googleapis.com/${bucket.name}/${blob.name}`
//         )
//         console.log(publicUrl)
//         resolve(publicUrl)
//     })
//     .on('error', () => {
//         reject(`Unable to upload image, something went wrong`)
//     })
//     .end(buffer)
// });

module.exports = {ifFileExists, uploadImage}
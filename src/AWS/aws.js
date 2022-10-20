const aws=require('aws-sdk')

aws.config.update({
    accessKeyId: "AKIAY3L35MCRZNIRGT6N",
    secretAccessKey: "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",
    region: "ap-south-1"
})

const uploadFile=async function(file){
    return new Promise(function(resolve,reject){

        let s3= new aws.S3({apiVersion: '2006-03-01'}); 

        let uploadParams={
            ACL:"public-read",
            Bucket:"classroom-training-bucket",
            Key:"project5/"+file.originalname,
            Body:file.buffer   //  It manages the balance between various components in order to maintain the speed and provide a faster service.
        }

        s3.upload(uploadParams,function(err,data){
            if(err){
                return reject({"error":err})
            }
            console.log(data)
            console.log("file uploaded succesFull")
            return resolve(data.Location)

        })

    })
}


module.exports={uploadFile}
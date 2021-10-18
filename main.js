console.log('Loading function');
var sign = require('./index')
const fs = require("fs");
require('dotenv').config({path: __dirname + '/.env'});
const aws = require('aws-sdk');


console.log(process.env.AWS_REGION)
aws.config.update(
    {
        region: `${process.env.AWS_REGION}`
    }
);

const s3 = new aws.S3({ apiVersion: '2006-03-01' });

exports.handler = async (event, context) => {

    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

    const params = {
        Bucket: bucket,
        Key: key,
    };
    try {
        const data = await s3.getObject(params).promise();

        path = `/tmp/${key}`;
        fs.writeFileSync(path, data.Body,(err) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log('Data written to file');
        });

        const newName = key.split('.')[0] +'_КЕП.' + key.split('.')[1]

        await sign(key, newName )

        path = `/tmp/${newName}`;
        attachment = await fs.readFileSync(path);


        const uploadToS3 = async () => {

            const params = {
                Bucket: `${process.env.BUCKETNAME}`,
                Key: `sign/${newName}`,
                Body: attachment,
                ContentType: 'application/pdf',
                acl: 'private',
                contentDisposition: 'attachment',
                ServerSideEncryption: 'AES256'
            };
            try {
                const data = await s3.upload(params).promise();
                console.log("Success uploading data");
            } catch (err) {
                console.log("Error uploading data. ", err);
            }
        }

        await uploadToS3()

        return 'add file';
    } catch (err) {
        console.log(err);
        const message = `Error getting object ${key} from bucket ${bucket}. Make sure they exist and your bucket is in the same region as this function.`;
        console.log(message);
        throw new Error(message);
    }
};

const aws = require('aws-sdk');
const dynamo = new aws.DynamoDB.DocumentClient();
const crypto = require("crypto");
const axios = require('axios');
const s3 = new aws.S3();

const tableName = "UserTable";
const bucketName = process.env.PFP_STORAGE_BUCKET;

exports.handler = async (event, context) => {
    let body;
    let statusCode = 200;
    const headers = {
        'Access-Control-Allow-Origin': '*',
    };
    let uuid = crypto.randomUUID();
    let item;

    try {
        let requestJSON = JSON.parse(event.body);

        // pfp
        const profilePictureUrl = "https://cdn-icons-png.flaticon.com/128/847/847969.png";
        const response = await axios.get(profilePictureUrl, {
            responseType: 'arraybuffer'
        });
        const profilePictureData = Buffer.from(response.data, 'binary');
        const key = `${uuid}/profile-picture.jpg`;

        await s3.putObject({
            Bucket: bucketName,
            Key: key,
            Body: profilePictureData,
            ContentEncoding: 'base64',
            ContentType: response.headers['content-type']
        }).promise();

        s3Url = `https://${bucketName}.s3.amazonaws.com/${key}`;

        // add user
        if (requestJSON.userType == "Child") {
            let parentUser = await dynamo.get(
                {
                  TableName: tableName,
                  Key: {
                    userId: requestJSON.userId
                  },
                }
            ).promise();
            let email = parentUser.Item.email
            item = {
                userId: uuid,
                email: email,
                username: requestJSON.username,
                userType: requestJSON.userType,
                firstName: requestJSON.firstName,
                lastName: requestJSON.lastName,
                aboutMe: "",
                profilePictureUrl: s3Url || ''
            };
        
            await dynamo.put(
                {
                    TableName: tableName,
                    Item: item,
                }
            ).promise();
        } else {
            item = {
                userId: uuid,
                email: requestJSON.email,
                username: requestJSON.username,
                userType: requestJSON.userType,
                firstName: requestJSON.firstName,
                lastName: requestJSON.lastName,
                aboutMe: "",
                profilePictureUrl: s3Url || ''
            };
        
            await dynamo.put(
                {
                    TableName: tableName,
                    Item: item,
                }
            ).promise();
        }
    } catch (err) {
        statusCode = 400;
        body = err.message;
    } finally {
        body = {userId: item.userId, userType: item.userType, email: item.email};
        body = JSON.stringify(body);
    }

    return {
        statusCode,
        body,
        headers,
    };
};
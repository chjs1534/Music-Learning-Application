const aws = require('aws-sdk');

const dynamo = new aws.DynamoDB.DocumentClient();
const tableName = "UserTable";

exports.handler = async (event) => {
    let body;
    let statusCode = 200;
    const headers = {
        'Access-Control-Allow-Origin': '*',
    };
    let item;

    try {
        if (!event.request || !event.request.userAttributes) {
            const error = new Error('Invalid input data');
            error.statusCode = 400;
            throw error;
        }
        const userAttributes = event.request.userAttributes;
        if (!userAttributes.sub || !userAttributes.email || !userAttributes.preferred_username || !userAttributes['custom:userType'] 
            || !userAttributes['custom:firstName'] || !userAttributes['custom:lastName']) {
            const error = new Error('Missing required fields');
            error.statusCode = 400;
            throw error;
        }

        item = {
            userId: userAttributes.sub,
            email: userAttributes.email,
            username: userAttributes.preferred_username,
            userType: userAttributes['custom:userType'],
            firstName: userAttributes['custom:firstName'],
            lastName: userAttributes['custom:lastName'],
            aboutMe: ""
        };
    
        await dynamo.put(
            {
                TableName: tableName,
                Item: item,
            }
        ).promise();
        console.log("test")
    } catch (err) {
        console.log(err.message)
        statusCode = err.statusCode || 500;
        body = err.message;
    } finally {
        body = JSON.stringify(item);
    }

    return event;
};
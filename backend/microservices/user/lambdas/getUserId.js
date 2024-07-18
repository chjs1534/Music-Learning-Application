// const aws = require('aws-sdk');
// const dynamo = new aws.DynamoDB.DocumentClient();

// const tableName = "UserTable";

// exports.handler = async (event, context) => {
//     let body;
//     let statusCode = 200;
//     const headers = {
//         'Access-Control-Allow-Origin': '*',
//     };
//     let res;
    
//     try {
//         if (!event.pathParameters.username.includes("@")) body = await queryUsersByUsername(event.pathParameters.username);
//         else body = await queryUsersByEmail(event.pathParameters.username);
//         if (!result.Items || result.Items.length === 0) {
//             throw new Error("No user found with the given username or email.");
//         }
//         const user = body.Items[0];
//         res = {
//             userId: user.userId,
//             userType: user.userType
//         };
//     } catch (err) {
//         statusCode = 400;
//         body = err.message;
//     } finally {
//         body = JSON.stringify(res);
//     }

//     return {
//         statusCode,
//         body,
//         headers,
//     };
// };

// const queryUsersByUsername = async (username) => {
//     // Query as username
//     const params1 = {
//         TableName: tableName,
//         IndexName: "UsernameIndex",
//         KeyConditionExpression: "#username = :username",
//         ExpressionAttributeNames: {
//             "#username": "username"
//         },
//         ExpressionAttributeValues: {
//             ":username": username
//         }
//     };
//     return await dynamo.query(params1).promise();
// };

// const queryUsersByEmail = async (email) => {
//     // Query as email
//     const params1 = {
//         TableName: tableName,
//         IndexName: "EmailIndex",
//         KeyConditionExpression: "#email = :email",
//         ExpressionAttributeNames: {
//             "#email": "email"
//         },
//         ExpressionAttributeValues: {
//             ":email": email
//         }
//     };
//     return await dynamo.query(params1).promise();
// };

const aws = require('aws-sdk');
const dynamo = new aws.DynamoDB.DocumentClient();

const tableName = "UserTable";

exports.handler = async (event, context) => {
    let body;
    let statusCode = 200;
    const headers = {
        'Access-Control-Allow-Origin': '*',
    };
    let res = {};

    try {
        if (!event.pathParameters.username.includes("@")) {
            body = await queryUsersByUsername(event.pathParameters.username);
        } else {
            body = await queryUsersByEmail(event.pathParameters.username);
        }

        if (!body.Items || body.Items.length === 0) {
            throw new Error("No user found with the given username or email.");
        }

        const user = body.Items[0];
        res = {
            userId: user.userId,
            userType: user.userType
        };
    } catch (err) {
        statusCode = 400;
        res = { error: err.message };
    }

    return {
        statusCode,
        body: JSON.stringify(res),
        headers,
    };
};

const queryUsersByUsername = async (username) => {
    // Query by username
    const params1 = {
        TableName: tableName,
        IndexName: "UsernameIndex",
        KeyConditionExpression: "#username = :username",
        ExpressionAttributeNames: {
            "#username": "username"
        },
        ExpressionAttributeValues: {
            ":username": username
        }
    };
    return await dynamo.query(params1).promise();
};

const queryUsersByEmail = async (email) => {
    // Query by email
    const params1 = {
        TableName: tableName,
        IndexName: "EmailIndex",
        KeyConditionExpression: "#email = :email",
        ExpressionAttributeNames: {
            "#email": "email"
        },
        ExpressionAttributeValues: {
            ":email": email
        }
    };
    return await dynamo.query(params1).promise();
};

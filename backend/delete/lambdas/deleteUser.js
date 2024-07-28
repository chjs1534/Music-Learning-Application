const aws = require('aws-sdk');

const dynamo = new aws.DynamoDB.DocumentClient();
const cognito = new aws.CognitoIdentityServiceProvider();
const userPoolId = process.env.USERPOOL_ID

exports.handler = async (event) => {
    let body;
    let statusCode = 200;
    const headers = {
        'Access-Control-Allow-Origin': '*',
    };
    let item;

    try {
        if (!userPoolId) {
            throw new Error('USERPOOL_ID environment variable is not set');
        }
        
        if (!event.pathParameters || !event.pathParameters.userId) {
            const error = new Error('Missing pathParameters or userId');
            error.statusCode = 400;
            throw error;
        }
        const userId = event.pathParameters.userId;
        if (typeof userId !== 'string' || userId.trim() === '') {
            const error = new Error('Invalid userId');
            error.statusCode = 400;
            throw error;
        }
        
        // Get user type
        item = {userId: userId}
        let userType;
        try {
            const currUser = await dynamo.get(
                {
                  TableName: "UserTable",
                  Key: item
                }
            ).promise();
            userType = currUser.Item.userType;
        } catch(err) {
            console.error(err);
        }

        if (userType === "Parent") {
            let children;
            try {
                let parentUser = await dynamo.get(
                    {
                    TableName: "UserTable",
                    Key: item
                    }
                ).promise();
                let email = parentUser.Item.email

                // Query by email
                const params = {
                    TableName: "UserTable",
                    IndexName: "EmailIndex",
                    KeyConditionExpression: "#email = :email",
                    FilterExpression: "#userType = :userType",
                    ExpressionAttributeNames: {
                        "#email": "email",
                        "#userType": "userType"
                    },
                    ExpressionAttributeValues: {
                        ":email": email,
                        ":userType": "Child"
                    }
                };
                let childrenResult = await dynamo.query(params).promise();
                children = childrenResult.Items;
            } catch (err) {
                console.error('Failed to get children accounts:', err);
            }
            for (let child of children) {
                await doDeleteUser({userId: child.userId});
            }
        } 
        
        await doDeleteUser(item);
    } catch (err) {
        statusCode = err.statusCode || 500;
        body = err.message;
    } finally {
        body = JSON.stringify(item);
    }

    return {
        statusCode,
        body,
        headers,
    };
};

const doDeleteUser = async(item) => {
    // delete from cognito user pool
    try {
        const user = await dynamo.get({
            TableName: "UserTable",
            Key: item
        }).promise();

        await cognito.adminDeleteUser({
            UserPoolId: userPoolId,
            Username: user.Item['username']
        }).promise();
    } catch (cognitoError) {
        console.error('Failed to delete from Cognito User Pool:', cognitoError);
    }
    
    // delete from match database
    try {
        const matches = queryPairs(item.userId);

        for (let match of matches) {
            await dynamo.delete({
                TableName: "MatchTable",
                Key: match
            }).promise();
        }
    } catch(err) {
        console.error('Failed to delete from match database', matchError);
    }
    
    // delete from user database
    try {
        await dynamo.delete({
            TableName: "UserTable",
            Key: item
        }).promise();
    } catch (dynamoError) {
        console.error('Failed to delete from User DynamoDB:', dynamoError);
    }
}

const queryPairs = async (userId) => {
    try {
        // Query as userId1
        const params1 = {
            TableName: "MatchTable",
            KeyConditionExpression: "#uid1 = :userId",
            FilterExpression: "#request = :request",
            ExpressionAttributeNames: {
                "#uid1": "userId1",
                "#request": "request"
            },
            ExpressionAttributeValues: {
                ":userId": userId,
                ":request": false
            }
        };
        const result1 = await dynamo.query(params1).promise();

        // Query as userId2
        const params2 = {
            TableName: "MatchTable",
            IndexName: "UserId2Index",
            KeyConditionExpression: "#uid2 = :userId",
            FilterExpression: "#request = :request",
            ExpressionAttributeNames: {
                "#uid2": "userId2",
                "#request": "request"
            },
            ExpressionAttributeValues: {
                ":userId": userId,
                ":request": false
            }
        };
        const result2 = await dynamo.query(params2).promise();

        return { Items: result1.Items.concat(result2.Items) };
    } catch (queryError) {
        console.error('Failed to query match pairs:', queryError);
        throw queryError;
    }
};
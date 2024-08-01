const aws = require('aws-sdk');
const lambda = new aws.Lambda();
const lambdaGetUser = "GetUser"
const lambdaGetMatches = "GetMatches"
const lambdaGetFamily = "GetFamily"

exports.handler = async (event, context) => {
    let body;
    let statusCode = 200;
    const headers = {
        'Access-Control-Allow-Origin': '*',
    };

    let userType;
    let newBody = [];

    try {
        const userId = event.pathParameters.userId;

        // Get current user type
        const user = await lambda.invoke({
            FunctionName: lambdaGetUser,
            Payload: JSON.stringify({ userId: userId })
        }).promise();
        const userPayload = JSON.parse(user.Payload);
        userType = JSON.parse(userPayload.body).userType;
        
        if (userType === "Teacher") {
            // Get current user matches
            const matches = await lambda.invoke({
                FunctionName: lambdaGetMatches,
                Payload: JSON.stringify({ userId: userId })
            }).promise();
            const matchPayload = JSON.parse(matches.Payload);
            const matchList = JSON.parse(matchPayload.body).matches;
                
            for (const item of matchList) {
                // Get match user
                const matchUserId = item.userId;
                let matchUserForMessaging;

                // Show parent account instead of child
                // Get match user type
                const matchUser = await lambda.invoke({
                    FunctionName: lambdaGetUser,
                    Payload: JSON.stringify({ userId: matchUserId })
                }).promise();
                const matchUserPayload = JSON.parse(matchUser.Payload);
                matchUserForMessaging = JSON.parse(matchUserPayload.body);
                const matchUserUserType = matchUserForMessaging.userType;
                if (matchUserUserType === "Child") {
                    // Get parent user instead
                    const getFamily = await lambda.invoke({
                        FunctionName: lambdaGetFamily,
                        Payload: JSON.stringify({ userId: matchUserId })
                    }).promise();
                    const getFamilyPayload = JSON.parse(getFamily.Payload);
                    matchUserForMessaging = JSON.parse(getFamilyPayload.body).users[0];
                } 
                newBody.push({userId: matchUserForMessaging.userId});
            } 
        } else if (userType === "Parent") {
            // Get child accounts
            const getFamily = await lambda.invoke({
                FunctionName: lambdaGetFamily,
                Payload: JSON.stringify({ userId: userId })
            }).promise();
            const getFamilyPayload = JSON.parse(getFamily.Payload);
            const childrenUsers = JSON.parse(getFamilyPayload.body).users;

            // Get children user matches 
            for (let child of childrenUsers) {
                const matches = await lambda.invoke({
                    FunctionName: lambdaGetMatches,
                    Payload: JSON.stringify({ userId: child.userId })
                }).promise();
                const matchPayload = JSON.parse(matches.Payload);
                newBody.push(...JSON.parse(matchPayload.body).matches);
            }
        } else {
            // Get current user matches
            const matches = await lambda.invoke({
                FunctionName: lambdaGetMatches,
                Payload: JSON.stringify({ userId: userId })
            }).promise();
            const matchPayload = JSON.parse(matches.Payload);
            newBody = JSON.parse(matchPayload.body).matches;
        }
    } catch (err) {
        statusCode = 400;
        body = err.message;
        console.error('Error:', err);
    } finally {
        body = JSON.stringify({matches: newBody});
    }

    return {
        statusCode,
        body,
        headers,
    };
};
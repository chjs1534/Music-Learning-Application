const aws = require('aws-sdk');
const dynamo = new aws.DynamoDB.DocumentClient();

const tableName = "UserTable";

exports.handler = async (event) => {
	let body;
    let statusCode = 200;
    const headers = {
        'Access-Control-Allow-Origin': '*',
    };
	let body3;

    try {
		let requestJSON = JSON.parse(event.body);
		const body1 = await dynamo.update(
			{
				TableName: tableName,
				Key: {
					userId: requestJSON.userId
				},
				UpdateExpression: "set #aboutMe = :aboutMe",
				ExpressionAttributeNames: {
					"#aboutMe": "aboutMe"
				},
				ExpressionAttributeValues: {
					":aboutMe": requestJSON.aboutMe
				}
			}
		).promise();

		const body2 = await dynamo.update(
			{
				TableName: tableName,
				Key: {
					userId: requestJSON.userId
				},
				UpdateExpression: "set #firstName = :firstName",
				ExpressionAttributeNames: {
					"#firstName": "firstName"
				},
				ExpressionAttributeValues: {
					":firstName": requestJSON.firstName
				}
			}
		).promise();

		body3 = await dynamo.update(
			{
				TableName: tableName,
				Key: {
					userId: requestJSON.userId
				},
				UpdateExpression: "set #lastName = :lastName",
				ExpressionAttributeNames: {
					"#lastName": "lastName"
				},
				ExpressionAttributeValues: {
					":lastName": requestJSON.lastName
				}
			}
		).promise();
    } catch (err) {
        statusCode = 400;
        body = err.message;
    } finally {
        body = JSON.stringify(body3);
    }

    return {
        statusCode,
        body,
        headers,
    };
};
const aws = require('aws-sdk');
const dynamo = new aws.DynamoDB.DocumentClient();

const tableName = "UserTable";

exports.handler = async (event) => {
	const requestJSON = JSON.parse(event.body);
	const userId = requestJSON.userId;
	const firstName = requestJSON.firstName;
	const lastName = requestJSON.lastName;
	const aboutMe = requestJSON.aboutMe;
	// Error checks
	if (typeof userId !== 'string' || userId.trim() === '') {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid userId' }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            }
        };
    }
    if (typeof firstName !== 'string' || firstName.trim() === '') {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid firstName' }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            }
        };
    }
	if (typeof lastName !== 'string' || lastName.trim() === '') {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid lastName' }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            }
        };
    }
    if (typeof aboutMe !== 'string') {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid aboutMe' }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            }
        };
    }
	// Check userid
	let user;
    try {
        user = await dynamo.get(
            {
              TableName: tableName,
              Key: {
                userId: userId
              },
            }
        ).promise();
        if (!user.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'User not found' }),
                headers: {
                    'Access-Control-Allow-Origin': '*',
                }
            };
        }
    } catch (err) {
        return {
            statusCode: err.statusCode,
            body: JSON.stringify({ error: err.message }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            }
        };
    }

	try {
		await dynamo.update(
			{
				TableName: tableName,
				Key: {
					userId: userId
				},
				UpdateExpression: "set #aboutMe = :aboutMe",
				ExpressionAttributeNames: {
					"#aboutMe": "aboutMe"
				},
				ExpressionAttributeValues: {
					":aboutMe": aboutMe
				}
			}
		).promise();
	} catch (err) {
		return {
            statusCode: err.statusCode,
            body: JSON.stringify({ error: err.message }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            }
        };
	}

	try {
		await dynamo.update(
			{
				TableName: tableName,
				Key: {
					userId: userId
				},
				UpdateExpression: "set #firstName = :firstName",
				ExpressionAttributeNames: {
					"#firstName": "firstName"
				},
				ExpressionAttributeValues: {
					":firstName": firstName
				}
			}
		).promise();
	} catch (err) {
		return {
            statusCode: err.statusCode,
            body: JSON.stringify({ error: err.message }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            }
        };
	}

	try {
		await dynamo.update(
			{
				TableName: tableName,
				Key: {
					userId: userId
				},
				UpdateExpression: "set #lastName = :lastName",
				ExpressionAttributeNames: {
					"#lastName": "lastName"
				},
				ExpressionAttributeValues: {
					":lastName": lastName
				}
			}
		).promise();
	} catch (err) {
		return {
            statusCode: err.statusCode,
            body: JSON.stringify({ error: err.message }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            }
        };
	}

    return {
        statusCode: 200,
        body: JSON.stringify({}),
        headers: {
            'Access-Control-Allow-Origin': '*',
        }
    };
};
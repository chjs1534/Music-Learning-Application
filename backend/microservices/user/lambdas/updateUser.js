/**
 * AWS Lambda function to update a user's profile information in the "UserTable".
 * 
 * - Updates the user's first name, last name, and "about me" section in the user table.
 * 
 * @param {Object} event - The event object.
 * @param {string} event.body - The JSON-encoded request body containing the user's data to update.
 * 
 * @returns {Object} response - The HTTP response object.
 * @returns {number} response.statusCode - The HTTP status code.
 * @returns {Object} response.body - The JSON-encoded response body, empty on success or containing an error message.
 * @returns {Object} response.headers - The HTTP response headers, including CORS settings.
 * 
 * Error Handling:
 * - Returns HTTP 400 if the userId, firstName, lastName, or aboutMe fields are missing or invalid.
 * - Returns HTTP 404 if the user is not found in the database.
 * - Returns the appropriate HTTP status code and error message if there is an issue accessing or updating the user table.
 */

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
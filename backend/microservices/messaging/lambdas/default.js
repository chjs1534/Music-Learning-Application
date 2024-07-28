const aws = require('aws-sdk');

exports.handler = async (event) => {
    let body = JSON.stringify({default: "default"});
    let statusCode = 200;
    const headers = {
        'Access-Control-Allow-Origin': '*',
    };

    return {
        statusCode,
        body,
        headers,
    };
};
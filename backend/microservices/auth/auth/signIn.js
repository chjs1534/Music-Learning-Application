const jwt_decode = require('jwt-decode');

exports.handler = async (event) => {

    const tokenDecode = jwt_decode(event.headers.Authorization);

    return  {
        statusCode: 200,
        body: JSON.stringify('Decoded token: ' + tokenDecode.name + "!"),
    };
};
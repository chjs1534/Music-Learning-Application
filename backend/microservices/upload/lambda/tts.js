const { PollyClient, SynthesizeSpeechCommand } = require("@aws-sdk/client-polly");

const client = new PollyClient();

/**
 * AWS Lambda handler to genereate text-to-speech mp3 from a string using AWS Polly.
 *
 * @param {object} event - The event object containing request parameters.
 * @param {object} context - The context object containing runtime information.
 * @param {function} callback - The callback function to send the response.
 * 
 * Event parameters:
 * @param {string} text     Text string to generate a text to speech mp3 for.
 * 
 * Response body:
 * base64 encoded data for the mp3 file
 */
exports.handler = async (event, context, callback) => {
  try {
    context.callbackWaitsForEmptyEventLoop = false;

    const text = event.queryStringParameters.text;

    if (!text) {
      throw new Error('Missing required body parameters.');
    }

    const input = {
      OutputFormat: 'mp3',
      Text: text,
      VoiceId: 'Joanna',
      Engine: 'neural'
    };

    const command = new SynthesizeSpeechCommand(input);
    const response = await client.send(command);

    if (!response || !response.AudioStream) {
      throw new Error('Failed to generate speech audio.');
    }

    const data = await response.AudioStream.transformToString('base64');
    
    callback(null, {
      statusCode: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
      },
      body: data,
      isBase64Encoded: true
    });
  } catch (e) {
    let statusCode = 400;
    let message = e.message;

    if (message.includes('Missing required body parameters.')) {
      statusCode = 400;
    } else if (message.includes('Failed to generate speech audio.')) {
      statusCode = 422;
    } else {
      statusCode = 500;
      message = 'Internal Server Error';
    }
    
    callback(null, {
      statusCode: statusCode,
      body: JSON.stringify({
        error: message,
      }),
      headers: {
          'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
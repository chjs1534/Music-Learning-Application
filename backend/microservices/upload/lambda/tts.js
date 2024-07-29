const { PollyClient, SynthesizeSpeechCommand } = require("@aws-sdk/client-polly");

const client = new PollyClient();

exports.handler = async (event, context, callback) => {
  try {
    context.callbackWaitsForEmptyEventLoop = false;

    const text = event.queryStringParameters.text;
    console.log(text)

    const input = {
      OutputFormat: 'mp3',
      Text: text,
      VoiceId: 'Joanna',
      Engine: 'neural'
    };

    const command = new SynthesizeSpeechCommand(input);
    const response = await client.send(command);
    const data = await response.AudioStream.transformToString('base64');
    console.log(response);
    console.log(data)
    
    callback(null, {
      statusCode: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
      },
      body: data,
      isBase64Encoded: true
    });
  } catch (e) {
    callback(null, {
      statusCode: 500,
      body: JSON.stringify({
        error: e
      }),
      headers: {
          'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
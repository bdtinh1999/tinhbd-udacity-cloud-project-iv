require('source-map-support/register');

const middy = require('middy');
const { cors, httpErrorHandler } = require('middy/middlewares');
const { createAttachmentPresignedUrl } = require('../../businessLogic/todos');
const { getUserId } = require('../utils');

exports.handler = middy(async (event) => {
  const userId = getUserId(event);
  const todoId = event.pathParameters.todoId;
  try {
    const url = await createAttachmentPresignedUrl(userId, todoId);
    return {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      statusCode: 201,
      body: JSON.stringify({ uploadUrl: url }),
    };
  } catch (err) {
    return {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      statusCode: 500,
      body: JSON.stringify({ Error: err.message }),
    };
  }
});

exports.handler
  .use(httpErrorHandler())
  .use(cors({
    credentials: true,
  }));

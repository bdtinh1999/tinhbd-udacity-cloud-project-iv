require('source-map-support/register');

const middy = require('middy');
const { cors } = require('middy/middlewares');
const { getTodosForUser } = require('../../businessLogic/todos');
const { getUserId } = require('../utils');

exports.handler = middy(async (event) => {
  try {
    const userId = getUserId(event);
    const todos = await getTodosForUser(userId);
    return {
      statusCode: 200,
      body: JSON.stringify({ items: todos }),
    };
  } catch (error) {
    return {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
});

exports.handler.use(
  cors({
    credentials: true,
  })
);

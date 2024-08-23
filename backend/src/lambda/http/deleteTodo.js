require('source-map-support/register');

const middy = require('middy');
const { cors, httpErrorHandler } = require('middy/middlewares');
const { DeleteTodo } = require('../../businessLogic/todos');
const { getUserId } = require('../utils');

exports.handler = middy(async (event) => {
  const todoId = event.pathParameters.todoId;
  const userId = getUserId(event);
  try {
    await DeleteTodo(userId, todoId);
    return {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      statusCode: 204,
      body: '',
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

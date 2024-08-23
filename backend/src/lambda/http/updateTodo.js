require('source-map-support/register');

const middy = require('middy');
const { cors, httpErrorHandler } = require('middy/middlewares');
const { UpdateTodo } = require('../../businessLogic/todos');
const { getUserId } = require('../utils');

exports.handler = middy(async (event) => {
  try {
    const todoId = event.pathParameters.todoId;
    const updatedTodo = JSON.parse(event.body);
    const userId = getUserId(event);
    await UpdateTodo(userId, todoId, updatedTodo);
    return {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      statusCode: 204,
      body: JSON.stringify({ item: updatedTodo }),
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

exports.handler
  .use(httpErrorHandler())
  .use(cors({
    credentials: true,
  }));

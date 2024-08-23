const AWS = require('aws-sdk');
const AWSXRay = require('aws-xray-sdk');
const { createLogger } = require('../utils/logger');
const { TodoItem } = require('../models/TodoItem');
const { TodoUpdate } = require('../models/TodoUpdate');

const XAWS = AWSXRay.captureAWS(AWS);
const logger = createLogger('TodoAccess');
const urlExpiration = process.env.SIGNED_URL_EXPIRATION;
const s3BucketName = process.env.ATTACHMENT_S3_BUCKET;

class TodosAccess {
  constructor(
    docClient = createDynamoDBClient(),
    todosTable = process.env.TODOS_TABLE,
    todosIndex = process.env.TODOS_CREATED_AT_INDEX,
    S3 = new XAWS.S3({ signatureVersion: 'v4' }),
    bucketName = s3BucketName
  ) {
    this.docClient = docClient;
    this.todosTable = todosTable;
    this.todosIndex = todosIndex;
    this.S3 = S3;
    this.bucketName = bucketName;
  }

  async getAll(userId) {
    logger.info('Call function get all');
    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        IndexName: this.todosIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
      })
      .promise();
    return result.Items;
  }


  async create(item) {
    logger.info('Call function create');
    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: item,
      })
      .promise();
    return item;
  }

  async update(userId, todoId, todoUpdate) {
    logger.info(`Updating todo item ${todoId} in ${this.todosTable}`);
    try {
      await this.docClient
        .update({
          TableName: this.todosTable,
          Key: {
            userId,
            todoId,
          },
          UpdateExpression: 'set #name = :name, #dueDate = :dueDate, #done = :done',
          ExpressionAttributeNames: {
            '#name': 'name',
            '#dueDate': 'dueDate',
            '#done': 'done',
          },
          ExpressionAttributeValues: {
            ':name': todoUpdate.name,
            ':dueDate': todoUpdate.dueDate,
            ':done': todoUpdate.done,
          },
          ReturnValues: 'UPDATED_NEW',
        })
        .promise();
    } catch (error) {
      logger.error('Error =======> updating Todo.', {
        error: error,
        data: {
          todoId,
          userId,
          todoUpdate,
        },
      });
      throw new Error(error);
    }
    return todoUpdate;
  }

  async delete(userId, todoId) {
    logger.info(`Deleting todo item ${todoId} from ${this.todosTable}`);
    try {
      await this.docClient
        .delete({
          TableName: this.todosTable,
          Key: {
            userId,
            todoId,
          },
        })
        .promise();
      return 'success';
    } catch (e) {
      logger.info('Error ==>>', {
        error: e,
      });
      return 'Error';
    }
  }

  async getUploadUrl(todoId, userId) {
    const uploadUrl = this.S3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: todoId,
      Expires: Number(urlExpiration),
    });
    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: {
          userId,
          todoId,
        },
        UpdateExpression: 'set attachmentUrl = :URL',
        ExpressionAttributeValues: {
          ':URL': uploadUrl.split('?')[0],
        },
        ReturnValues: 'UPDATED_NEW',
      })
      .promise();
    return uploadUrl;
  }
}


function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance');
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000',
    });
  }

  return new XAWS.DynamoDB.DocumentClient();
}

module.exports = { TodosAccess };

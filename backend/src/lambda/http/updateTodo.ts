import 'source-map-support/register';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest';

import * as middy from 'middy';
import { cors } from 'middy/middlewares';


const docClient = new AWS.DynamoDB.DocumentClient();
const todosTable = process.env.TODOS_TABLE;

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId;
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body);

  await docClient.update({
    TableName: todosTable,
    Key: { todoId },
    UpdateExpression: `SET #name = :name, #dueDate = :dueDate, #done = :done`,
    ExpressionAttributeValues: {
      ':name': updatedTodo.name,
      ':dueDate': updatedTodo.dueDate,
      ':done': updatedTodo.done
    },
    ExpressionAttributeNames: {
      '#name': 'name',
      '#dueDate': 'dueDate',
      '#done': 'done'
    }
  }).promise();

  return {
    statusCode: 204,
    body: null
  }
});

handler.use(cors());

import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import * as uuid from 'uuid';
import { CreateTodoRequest } from '../../requests/CreateTodoRequest';
import { TodoItem } from '../../models/TodoItem';

const docClient = new AWS.DynamoDB.DocumentClient();
const todosTable = process.env.TODOS_TABLE;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event);
  const todoId = uuid.v4();
  const payload: CreateTodoRequest = JSON.parse(event.body);
  const createdAt = Date.now().toString();
  const newTodo: TodoItem = {
    todoId,
    createdAt,
    userId: null,
    done: false,
    ...payload
  };

  await docClient.put({
    TableName: todosTable,
    Item: newTodo
  }).promise();

  // TODO: Implement creating a new TODO item
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({ item: newTodo })
  }
}

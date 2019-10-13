import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import * as uuid from 'uuid';
import { CreateTodoRequest } from '../../requests/CreateTodoRequest';

const docClient = new AWS.DynamoDB.DocumentClient();
const todosTable = process.env.TODOS_TABLE;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event);
  const id = uuid.v4();
  const newTodo: CreateTodoRequest = {
    id,
    ...JSON.parse(event.body)
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
    body: JSON.stringify({ newTodo })
  }
}

import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import * as uuid from 'uuid';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import { CreateTodoRequest } from '../../requests/CreateTodoRequest';
import { TodoItem } from '../../models/TodoItem';
import { getToken, parseUserId } from '../../auth/utils';

const docClient = new AWS.DynamoDB.DocumentClient({ convertEmptyValues: true });
const todosTable = process.env.TODOS_TABLE;

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event);
  const todoId = uuid.v4();
  const payload: CreateTodoRequest = JSON.parse(event.body);
  const createdAt = Date.now().toString();
  const token = getToken(event.headers.Authorization);
  const userId = parseUserId(token);
  const newTodo: TodoItem = {
    todoId,
    createdAt,
    userId,
    done: false,
    ...payload
  };

  await docClient.put({
    TableName: todosTable,
    Item: newTodo
  }).promise();

  return {
    statusCode: 201,
    body: JSON.stringify({ item: newTodo })
  }
});

handler.use(cors({}));



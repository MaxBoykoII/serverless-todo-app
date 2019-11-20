import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest';
import { updateTodo } from '../../businessLogic/todo';

import * as middy from 'middy';
import { cors } from 'middy/middlewares';

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId;
  const update: UpdateTodoRequest = JSON.parse(event.body);

  await updateTodo(todoId, update);

  return {
    statusCode: 204,
    body: null
  }
});

handler.use(cors());

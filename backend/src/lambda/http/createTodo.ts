import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import { CreateTodoRequest } from '../../requests/CreateTodoRequest';
import { getToken } from '../../auth/utils';
import { createTodo } from '../../businessLogic/todo';

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event);
  const payload: CreateTodoRequest = JSON.parse(event.body);
  const jwtToken = getToken(event.headers.Authorization);
  const item = await createTodo(payload, jwtToken);

  return {
    statusCode: 201,
    body: JSON.stringify({ item })
  }
});

handler.use(cors({}));



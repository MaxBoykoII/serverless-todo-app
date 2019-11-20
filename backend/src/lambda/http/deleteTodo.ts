import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import { deleteTodo } from '../../businessLogic/todo';
import { createLogger } from '../../utils/logger';

const logger = createLogger('DeleteTodo');

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event:', { event });
  
  const todoId: string = event.pathParameters.todoId

  await deleteTodo(todoId);

  return {
    statusCode: 204,
    body: JSON.stringify({})
  }
});

handler.use(cors());

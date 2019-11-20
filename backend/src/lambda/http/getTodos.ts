import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import { getToken } from '../../auth/utils';
import { getTodos } from '../../businessLogic/todo';
import { createLogger } from '../../utils/logger';

const logger = createLogger('GetTodos');

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event:', { event });

  const jwtToken = getToken(event.headers.Authorization);
  const items = await getTodos(jwtToken);

  logger.info('Returning items:', { items });

  return {
    statusCode: 200,
    body: JSON.stringify({ items })
  };
})

handler.use(cors());

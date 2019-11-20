import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import { generateUploadUrl } from '../../businessLogic/todo';

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId;

  try {
    const uploadUrl = await generateUploadUrl(todoId);

    return {
      statusCode: 200,
      body: JSON.stringify({ uploadUrl })
    };
  } catch {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Todo does not exist.' })
    };
  }
});

handler.use(cors({}));
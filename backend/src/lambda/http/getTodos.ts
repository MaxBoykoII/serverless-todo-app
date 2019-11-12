import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';

const docClient = new AWS.DynamoDB.DocumentClient();

const todosTable = process.env.TODOS_TABLE;

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user
  console.log('processing event:', event);

  const result = await docClient.scan({
    TableName: todosTable
  }).promise();

  const items = result.Items;

  return {
    statusCode: 200,
    body: JSON.stringify({ items })
  };
})

handler.use(cors());

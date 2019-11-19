import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import { getToken, parseUserId } from '../../auth/utils';

const docClient = new AWS.DynamoDB.DocumentClient();

const todosTable = process.env.TODOS_TABLE;
const userIdIndex = process.env.USER_ID_INDEX;

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user
  console.log('processing event:', event);
  const token = getToken(event.headers.Authorization);
  const userId = parseUserId(token);
  console.log('parsed user id:', userId);
  const result = await docClient.query({
    TableName: todosTable,
    IndexName: userIdIndex,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    }
  }).promise();

  const items = result.Items;

  return {
    statusCode: 200,
    body: JSON.stringify({ items })
  };
})

handler.use(cors());

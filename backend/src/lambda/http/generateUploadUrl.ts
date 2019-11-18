import 'source-map-support/register';
import * as AWS from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';

const docClient = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3({
  signatureVersion: 'v4'
});

const bucketName = process.env.TODOS_S3_BUCKET;
const urlExpiration = process.env.SIGNED_URL_EXPIRATION;
const todosTable = process.env.TODOS_TABLE;

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId;
  const validTodoId = await todoExists(todoId);

  if (!validTodoId)
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Todo does not exist.' })
    };

  const uploadUrl = getPresignedUrl(todoId);

  await updateWithAttachmentUrl(todoId);

  return {
    statusCode: 200,
    body: JSON.stringify({ uploadUrl })
  };
});

handler.use(cors({}));

async function todoExists(todoId: string) {
  const todo = await docClient.get({
    TableName: todosTable,
    Key: {
      todoId
    }
  });

  return !!todo;
}

async function updateWithAttachmentUrl(todoId: string) {
  await docClient.update({
    TableName: todosTable,
    Key: { todoId },
    UpdateExpression: `SET #attachmentUrl = :attachmentUrl`,
    ExpressionAttributeValues: {
      ':attachmentUrl': `https://${bucketName}.s3.amazonaws.com/${todoId}`,
    },
    ExpressionAttributeNames: {
      '#attachmentUrl': 'attachmentUrl'
    }
  }).promise();
}

function getPresignedUrl(todoId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId,
    Expires: urlExpiration
  });
}

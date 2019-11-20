import * as AWS from 'aws-sdk';

export class FileAccess {
    constructor(
        private readonly storageClient: AWS.S3 = new AWS.S3({ signatureVersion: 'v4' }),
        private readonly bucketName = process.env.TODOS_S3_BUCKET,
        private readonly signedUrlExpiration = process.env.SIGNED_URL_EXPIRATION,
        private readonly createAttachmentUrl: (todoId: string) => string = createS3AttachmentUrl) { }

    getPresignedUrl(todoId: string) {
        return this.storageClient.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: todoId,
            Expires: this.signedUrlExpiration
        });
    }

    getAttachmentUrl(todoId: string) {
        return this.createAttachmentUrl(todoId);
    }
}

function createS3AttachmentUrl(todoId: string) {
    const bucketName = process.env.TODOS_S3_BUCKET;
    const url = `https://${bucketName}.s3.amazonaws.com/${todoId}`;

    return url;
}
import * as AWS from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { TodoItem } from '../models/TodoItem';
import { TodoUpdate } from '../models/TodoUpdate';

export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todosTable: string = process.env.TODOS_TABLE,
        private readonly userIdIndex: string = process.env.USER_ID_INDEX) { }

    async createTodo(todo: TodoItem): Promise<TodoItem> {
        await this.docClient.put({
            TableName: this.todosTable,
            Item: todo
        }).promise();

        return todo;
    }

    async getTodos(userId: string): Promise<TodoItem[]> {
        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.userIdIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise();

        const items = result.Items as TodoItem[];

        return items;
    }

    async updateTodo(todoId: string, update: TodoUpdate) {
        await this.docClient.update({
            TableName: this.todosTable,
            Key: { todoId },
            UpdateExpression: `SET #name = :name, #dueDate = :dueDate, #done = :done`,
            ExpressionAttributeValues: {
                ':name': update.name,
                ':dueDate': update.dueDate,
                ':done': update.done
            },
            ExpressionAttributeNames: {
                '#name': 'name',
                '#dueDate': 'dueDate',
                '#done': 'done'
            }
        }).promise();
    }

    async updateAttachmentUrl(todoId: string, url: string) {
        await this.docClient.update({
            TableName: this.todosTable,
            Key: { todoId },
            UpdateExpression: `SET #attachmentUrl = :attachmentUrl`,
            ExpressionAttributeValues: {
                ':attachmentUrl': url
            },
            ExpressionAttributeNames: {
                '#attachmentUrl': 'attachmentUrl'
            }
        }).promise();
    }

    async deleteTodo(todoId: string) {
        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                todoId
            }
        }).promise();
    }

    async todoExists(todoId: string) {
        const todo = await this.docClient.get({
            TableName: this.todosTable,
            Key: {
                todoId
            }
        });

        return !!todo;
    }
}

function createDynamoDBClient() {
    return new AWS.DynamoDB.DocumentClient({ convertEmptyValues: true });
}
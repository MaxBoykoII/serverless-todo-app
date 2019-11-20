import * as uuid from 'uuid';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import { FileAccess } from '../dataLayer/fileAccess';
import { TodosAccess } from '../dataLayer/todosAccess';
import { TodoItem } from '../models/TodoItem';
import { TodoUpdate } from '../models/TodoUpdate';
import { parseUserId } from '../auth/utils';
import { createLogger } from '../utils/logger';

const logger = createLogger('TodoItem');

const fileAccess = new FileAccess();
const todosAccess = new TodosAccess();

export async function createTodo(request: CreateTodoRequest, jwtToken: string): Promise<TodoItem> {
    logger.info('Creating a new todo item', { request, jwtToken });

    const todoId = uuid.v4();
    const createdAt = Date.now().toString();
    const userId = parseUserId(jwtToken);
    const todo: TodoItem = {
        todoId,
        createdAt,
        userId,
        done: false,
        ...request
    };

    await todosAccess.createTodo(todo);

    logger.info('Successfully created a new todo item', todo);

    return todo;
}

export async function deleteTodo(todoId: string): Promise<void> {
    logger.info('Deleting todo item', { todoId });

    await todosAccess.deleteTodo(todoId);

    logger.info('Successfully deleted todo item');
}

export async function updateTodo(todoId: string, update: TodoUpdate): Promise<void> {
    logger.info('Updating todo item', { todoId, update });

    await todosAccess.updateTodo(todoId, update)

    logger.info('Successfully updated todo item');
}

export async function generateUploadUrl(todoId: string): Promise<string> {
    logger.info('Generating a presigned url for todo item', { todoId });

    const isValid = await todosAccess.todoExists(todoId);

    if (!isValid) {
        logger.warn(`No todo item matches ${todoId}`);
        throw new Error('Todo does not exist!');
    }

    const attachmentUrl = fileAccess.getAttachmentUrl(todoId);
    const presignedUrl = fileAccess.getPresignedUrl(todoId);

    await todosAccess.updateAttachmentUrl(todoId, attachmentUrl);

    logger.info(`A presigned url has been generated for todoItem ${todoId}`);

    return presignedUrl;
}

export async function getTodos(jwtToken: string): Promise<TodoItem[]> {
    const userId = parseUserId(jwtToken);

    logger.info(`Getting the todos for user ${userId}`);

    const results = await todosAccess.getTodos(userId);
    const items: TodoItem[] = results.map(({ userId, ...item }) => item);

    logger.info(`TodoItems have been retrieved for user ${userId}`, { items });

    return items;
}
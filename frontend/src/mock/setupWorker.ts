import { accountHandlers } from './account-mock';
import { annotationHandlers } from './annotations-mock';
import { changeHandlers } from './change-mock';
import { HttpHandler } from 'msw';
import { setupWorker } from 'msw/browser';

const handlers: HttpHandler[] = [...accountHandlers, ...annotationHandlers, ...changeHandlers];
export const worker = setupWorker(...handlers);

import { annotationHandlers } from './annotations-mock';
import { changeHandlers } from './change-mock';
import { HttpHandler } from 'msw';
import { selfHandlers } from './self-mock';

export const allHandlers: HttpHandler[] = [...selfHandlers, ...annotationHandlers, ...changeHandlers];

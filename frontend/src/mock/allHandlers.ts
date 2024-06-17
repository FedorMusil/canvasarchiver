import { accountHandlers } from './account-mock';
import { annotationHandlers } from './annotations-mock';
import { changeHandlers } from './change-mock';
import { HttpHandler } from 'msw';
import { sectionHandlers } from './sections-mock';

export const allHandlers: HttpHandler[] = [...accountHandlers, ...annotationHandlers, ...changeHandlers, ...sectionHandlers];

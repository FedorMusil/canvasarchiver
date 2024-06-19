import { HttpHandler } from 'msw';
import { annotationHandlers } from './annotations-mock';
import { changeHandlers } from './change-mock';
import { selfHandlers } from './self-mock';
import { sectionHandlers } from './sections-mock';

export const allHandlers: HttpHandler[] = [...selfHandlers, ...annotationHandlers, ...changeHandlers, ...sectionHandlers];

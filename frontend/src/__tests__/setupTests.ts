import * as matchers from '@testing-library/jest-dom/matchers';
import { afterAll, afterEach, beforeAll, expect } from 'vitest';
import { allHandlers } from '../mock/allHandlers';
import { cleanup } from '@testing-library/react';
import { setupServer } from 'msw/node';
expect.extend(matchers);

const serverWorker = setupServer(...allHandlers);

afterEach(() => cleanup());
beforeAll(() => serverWorker.listen());
afterAll(() => serverWorker.close());
afterEach(() => serverWorker.resetHandlers());

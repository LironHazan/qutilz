import { it, expect } from 'vitest';
import { mockResponse } from './index';

const API = 'http://petstore.swagger.io/v1/';

it('should return mock response', async () => {
  const mockedResponse = await mockResponse('pets', 'post', '201', {
    api: API,
  });
  console.log(mockedResponse);
  expect(mockedResponse).toEqual(0);
});

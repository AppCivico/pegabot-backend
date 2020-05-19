import supertest from 'supertest';
import { describe, it } from 'mocha';

import assert from 'assert';
import app from '../src/app';

describe('GET /status', () => {
  it('status code 200', (done) => {
    supertest(app)
      .get('/status')
      .expect(200)
      .end((err, res) => {
        done();
      });
  });
});

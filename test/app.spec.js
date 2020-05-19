import supertest from 'supertest';
import { describe, it } from 'mocha';

import assert from 'assert';
import app from '../src/app';

describe('GET /botometer - missing params', () => {
  const params = [
    {},
    { search_for: 'profile' },
    { profile: 'foobar' },
  ];

  params.forEach((testParam) => {
    it('status code 400', (done) => {
      supertest(app)
        .get('/botometer')
        .query(testParam)
        .end((err, res) => {
          assert(res.status === 400);
          assert(res.text === 'One parameter is missing');
          done();
        });
    });
  });
});


describe('GET /status', () => {
  it('status code 200', (done) => {
    supertest(app)
      .get('/status')
      .end((err, res) => {
        assert(res.status === 200);
        done();
      });
  });
});

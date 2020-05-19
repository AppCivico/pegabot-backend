import assert from 'assert';
import { describe, it } from 'mocha';
import supertest from 'supertest';
import sinon from 'sinon';
import TwitterLite from 'twitter-lite';
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

describe('GET /botometer - followers/friends, not authenticated', () => {
  const params = [
    { search_for: 'followers', profile: 'foobar' },
    { search_for: 'friends', profile: 'foobar' },
  ];

  const token = '123';
  sinon.stub(TwitterLite.prototype, 'getRequestToken').returns({ oauth_token: token });

  params.forEach((testParam) => {
    it('status code 200 and url', (done) => {
      supertest(app)
        .get('/botometer')
        .query(testParam)
        .end((err, res) => {
          assert(res.status === 200);
          assert(res.body.request_url === `https://api.twitter.com/oauth/authenticate?oauth_token=${token}`);
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

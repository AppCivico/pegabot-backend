import assert from 'assert';
import { describe, it } from 'mocha';
import supertest from 'supertest';
import sinon from 'sinon';
import TwitterLite from 'twitter-lite';
import app from '../src/app';
import data from './mock_data';


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

describe('GET /botometer - profile', () => {
  const params = [
    { search_for: 'profile', profile: 'foobar' },
  ];

  const token = '123';
  sinon.stub(TwitterLite.prototype, 'getBearerToken').returns({ access_token: token });
  sinon.stub(TwitterLite.prototype, 'get').callsFake((resource) => data.foobar[resource]);

  params.forEach((testParam) => {
    it('status code 200 and url', (done) => {
      supertest(app)
        .get('/botometer')
        .query(testParam)
        .end((err, res) => {
          const { body } = res;
          const profile = body.profiles[0];
          const langIndependent = profile.language_independent;

          assert(res.status === 200);
          assert(body.metadata.count === 1);
          assert(body.profiles.length === 1);
          assert(profile.username === testParam.profile);
          assert(profile.url === `https://twitter.com/${testParam.profile}`);
          assert(typeof profile.avatar === 'string');
          assert(profile.language_dependent === null);

          assert(profile.bot_probability.all === 0.1528148271769767);
          assert(langIndependent.friend === 0);
          assert(langIndependent.temporal === 0);
          assert(langIndependent.network === 0.5);
          assert(langIndependent.user === 0.11125930870790685);

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

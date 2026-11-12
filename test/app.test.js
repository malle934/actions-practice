const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');

chai.use(chaiHttp);
const { expect } = chai;

describe('API', () => {
  it('GET / returns app status', async () => {
    const res = await chai.request(app).get('/');
    expect(res).to.have.status(200);
    expect(res.body.status).to.equal('ok');
  });

  it('GET /health returns healthy', async () => {
    const res = await chai.request(app).get('/health');
    expect(res).to.have.status(200);
    expect(res.body.status).to.equal('healthy');
  });

  it('GET /planets returns 8 planets', async () => {
    const res = await chai.request(app).get('/planets');
    expect(res).to.have.status(200);
    expect(res.body).to.have.lengthOf(8);
  });

  it('GET /planets/3 returns Earth', async () => {
    const res = await chai.request(app).get('/planets/3');
    expect(res).to.have.status(200);
    expect(res.body.name).to.equal('Earth');
  });

  it('GET /planets/99 returns 404', async () => {
    const res = await chai.request(app).get('/planets/99');
    expect(res).to.have.status(404);
  });

  it('POST /add adds two numbers', async () => {
    const res = await chai.request(app).post('/add').send({ a: 2, b: 3 });
    expect(res).to.have.status(200);
    expect(res.body.result).to.equal(5);
  });

  it('POST /add rejects non-numbers', async () => {
    const res = await chai.request(app).post('/add').send({ a: 'x', b: 3 });
    expect(res).to.have.status(400);
  });
});

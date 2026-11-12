const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const { initDb, getPool, closeDb } = require('../db');

chai.use(chaiHttp);
const { expect } = chai;

// Integration tests: only run when a database is available (DATABASE_URL set).
// In CI this comes from a Postgres service container.
const describeDb = process.env.DATABASE_URL ? describe : describe.skip;

describeDb('Database integration', () => {
  before(async () => {
    await initDb();
    await getPool().query('TRUNCATE notes RESTART IDENTITY');
  });

  after(async () => {
    await closeDb();
  });

  it('GET /db-health reports connected', async () => {
    const res = await chai.request(app).get('/db-health');
    expect(res).to.have.status(200);
    expect(res.body.database).to.equal('connected');
  });

  it('POST /notes creates a note', async () => {
    const res = await chai.request(app).post('/notes').send({ text: 'first note' });
    expect(res).to.have.status(201);
    expect(res.body.text).to.equal('first note');
  });

  it('POST /notes rejects empty text', async () => {
    const res = await chai.request(app).post('/notes').send({ text: '  ' });
    expect(res).to.have.status(400);
  });

  it('GET /notes returns saved notes', async () => {
    const res = await chai.request(app).get('/notes');
    expect(res).to.have.status(200);
    expect(res.body).to.have.lengthOf(1);
    expect(res.body[0].text).to.equal('first note');
  });
});

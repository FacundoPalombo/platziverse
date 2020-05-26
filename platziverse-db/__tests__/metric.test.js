const ava = require("ava");
const proxyquire = require("proxyquire");
const sinon = require("sinon");
const { single } = require("./fixtures/metric"),
  metricFixtures = require("./fixtures/metric");
// Testing instances
let sandbox = null;
let db = null;
let config = {
  logging: function () {},
};
let AgentStub = { hasMany: () => {} };

/* :===---- Hooks ----===: */

ava.beforeEach(async () => {
  sandbox = sinon.createSandbox(config);
  sandbox.spy();

  // Metric base Stub

  const MetricStub = {
    belongsTo: sandbox.stub(),
  };

  // Stubs for create() method
  MetricStub.create = sandbox.stub();
  MetricStub.create.withArgs(single).returns(Promise.resolve(single));

  const setupDatabase = proxyquire("../", {
    "./models/agent": () => AgentStub,
    "./models/metric": () => MetricStub,
  });

  db = await setupDatabase(config);
});

ava.afterEach(() => {
  sandbox && sinon.restore();
});

ava.serial("GIVEN a Metric", (t) => {
  t.truthy(db.Metric, "THEN Metric service should exist");
});

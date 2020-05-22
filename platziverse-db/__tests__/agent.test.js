const setupAgentModel = require("../models/agent");
const ava = require("ava");
const proxyquire = require("proxyquire");
const sinon = require("sinon");
const agentFixtures = require("./fixtures/agent");

let db = null;
let sandbox = null;
let AgentStub = null;

let MetricStub = {
  belongsTo: sinon.spy(),
};
let config = {
  logging: function () {},
};

ava.beforeEach(async () => {
  sandbox = sinon.createSandbox(config);
  sandbox.spy();

  AgentStub = {
    hasMany: sandbox.spy(),
  };
  AgentStub.findById = sandbox.stub();
  AgentStub.findById
    .withArgs(1)
    .returns(Promise.resolve(agentFixtures.byId(1)));
  const setupDatabase = proxyquire("../", {
    "./models/agent": () => AgentStub,
    "./models/metric": () => MetricStub,
  });
  db = await setupDatabase(config);
});

ava.afterEach(() => {
  sandbox && sinon.restore();
});

ava("GIVEN an Agent", (t) => {
  t.truthy(db.Agent, "THEN Agent service SHOULD exist");
});
ava.serial("GIVEN an Setup", (t) => {
  t.true(
    AgentStub.hasMany.called,
    "THEN AgentModel.hasMany should be executed"
  );
  t.true(
    AgentStub.hasMany.calledWith(MetricStub),
    "THEN AgentModel.hasMany should be called with MetricModel Arguments"
  );
  t.true(
    MetricStub.belongsTo.called,
    "THEN MetricStub.belongsTo should be executed"
  );
  t.true(
    MetricStub.belongsTo.calledWith(AgentStub),
    "THEN MetricModel.belongsTo should be called with AgentModel Arguments"
  );
});
ava.serial("GIVEN an Agent and method findById", async (t) => {
  let agent = await db.Agent.findById(1);

  t.true(AgentStub.findById.called, "THEN findById should be called on model");
  t.true(AgentStub.findById.calledOnce, "THEN findById should be called once");
  t.true(
    AgentStub.findById.calledWith(1),
    "THEN findById should be called with the same args"
  );

  t.deepEqual(
    agent,
    agentFixtures.byId(1),
    "THEN Agent should return the same value in that method"
  );
});

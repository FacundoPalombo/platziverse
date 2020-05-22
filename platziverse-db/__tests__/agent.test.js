const setupAgentModel = require("../models/agent");
const ava = require("ava");
const proxyquire = require("proxyquire");
const sinon = require("sinon");
const agentFixtures = require("./fixtures/agent"),
  { single } = require("./fixtures/agent");

// Testing instances
let sandbox = null;
let db = null;
let config = {
  logging: function () {},
};

// Helpers
let _single = { ...single };

//Stubs

let AgentStub = null;
let MetricStub = {
  belongsTo: sinon.spy(),
};
let uuidArgs = {
  where: {
    uuid: single.uuid,
  },
};

/* :===---- Hooks ----===: */

ava.beforeEach(async () => {
  sandbox = sinon.createSandbox(config);
  sandbox.spy();

  // Model AgentStub
  AgentStub = {
    hasMany: sandbox.spy(),
  };

  // Model Agent.findOne Stub
  AgentStub.findOne = sandbox.stub();
  AgentStub.findOne
    .withArgs(uuidArgs)
    .returns(Promise.resolve(agentFixtures.byUuid(single.uuid)));

  // Model Agent.findById Stub
  AgentStub.findById = sandbox.stub();
  AgentStub.findById
    .withArgs(1)
    .returns(Promise.resolve(agentFixtures.byId(1)));

  // Model Agent.update Stub
  AgentStub.update = sandbox.stub();
  AgentStub.update.withArgs(single, uuidArgs).returns(Promise.resolve(single));

  const setupDatabase = proxyquire("../", {
    "./models/agent": () => AgentStub,
    "./models/metric": () => MetricStub,
  });

  db = await setupDatabase(config);
});

ava.afterEach(() => {
  sandbox && sinon.restore();
});

/* :=== ---- Tests ---- ===: */

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

// :=== Methods from Agent ===:

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

ava.serial("GIVEN an Agent and method createOrUpdate", async (t) => {
  let agent = await db.Agent.createOrUpdate(_single);
  t.deepEqual(agent, single, "THEN Agent should be the same element");
  t.true(AgentStub.findOne.called, "THEN findOne should be called on model");
  t.true(AgentStub.findOne.calledTwice, "THEn findOne should be called twice");
  t.true(AgentStub.update.calledOnce, "THEN update should be called once");
  t.true(
    AgentStub.update.calledWith(_single),
    "THEN update should be called with the same args"
  );
});

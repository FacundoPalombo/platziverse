const setupAgentModel = require("../models/agent");
const ava = require("ava");
const proxyquire = require("proxyquire");
const sinon = require("sinon");
const agentFixtures = require("./fixtures/agent"),
  { single, all, connected } = require("./fixtures/agent");

// Testing instances
let sandbox = null;
let db = null;
let config = {
  logging: function () {},
};

// Helpers
let _single = { ...single };
let usernameHelper = "platzi";
let uuidHelper = "yyy-yyy-yyy";

// Stubs

let AgentStub = null;
let MetricStub = {
  belongsTo: sinon.spy(),
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
    .withArgs({ where: { uuid: single.uuid } })
    .returns(Promise.resolve(agentFixtures.byUuid(single.uuid)));

  // Model Agent.findById Stub
  AgentStub.findById = sandbox.stub();
  AgentStub.findById
    .withArgs(1)
    .returns(Promise.resolve(agentFixtures.byId(1)));

  // Model Agent.findByUuid Stub
  AgentStub.findByUuid = sandbox.stub();
  AgentStub.findByUuid
    .withArgs(uuidHelper)
    .returns(Promise.resolve(agentFixtures.byUuid(uuidHelper)));

  // Model Agent.findAll Stub
  AgentStub.findAll = sandbox.stub();
  AgentStub.findAll.returns(Promise.resolve(all));
  AgentStub.findAll
    .withArgs({ where: { connected: true } })
    .returns(Promise.resolve(connected));
  AgentStub.findAll
    .withArgs({ where: { username: usernameHelper } })
    .returns(agentFixtures.byUsername(usernameHelper));

  // Model Agent.findConnected Stub
  AgentStub.findConnected = sandbox.stub();
  AgentStub.findConnected.returns(Promise.resolve(connected));

  // Model Agent.findByUsername Stub
  AgentStub.findByUsername = sandbox.stub();
  AgentStub.findByUsername
    .withArgs("platzi")
    .returns(Promise.resolve(agentFixtures.byUsername("platzi")));

  // Model Agent.update Stub
  AgentStub.update = sandbox.stub();
  AgentStub.update
    .withArgs(single, { where: { uuid: single.uuid } })
    .returns(Promise.resolve(single));

  // Model Agent.create Stub
  AgentStub.create = sandbox.stub();
  AgentStub.create
    .withArgs(agentFixtures.byUuid(uuidHelper))
    .returns(Promise.resolve(agentFixtures.byUuid(uuidHelper)));

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

ava.serial("GIVEN an Agent and method createOrUpdate#updated", async (t) => {
  let agent = await db.Agent.createOrUpdate(_single);
  t.deepEqual(agent, single, "THEN Agent should be the same element");
  t.true(AgentStub.findOne.called, "THEN findOne should be called on model");
  t.true(AgentStub.findOne.calledTwice, "THEN findOne should be called twice");
  t.true(AgentStub.update.calledOnce, "THEN update should be called once");
  t.true(
    AgentStub.update.calledWith(_single),
    "THEN update should be called with the same args"
  );
});

ava.serial(
  "GIVEN an Agent and method createOrUpdate#noModification",
  async (t) => {
    let agent = await db.Agent.createOrUpdate(_single);
    AgentStub.update = sandbox
      .stub()
      .rejects(new Error("Example error in promise"));
    t.true(AgentStub.findOne.called, "THEN findOne should be called on model");
    t.true(AgentStub.findOne.calledTwice, "THEN findOne should be called once");
  }
);

ava.serial("GIVEN an Agent and method findByUuid", async (t) => {
  let agent = await db.Agent.findByUuid(uuidHelper);

  t.true(AgentStub.findOne.called, "THEN findOne should be called on model");
  t.true(AgentStub.findOne.called, "THEN findOne should be called once");
  t.true(
    AgentStub.findOne.calledWith({ where: { uuid: uuidHelper } }),
    "THEN findByUuid should be called with the same args"
  );

  t.deepEqual(
    agent,
    agentFixtures.byUuid(uuidHelper),
    "THEN Agent should return the same value in that method"
  );
});

ava.serial("GIVEN an Agent and method findAll", async (t) => {
  let agent = await db.Agent.findAll();
  t.true(
    AgentStub.findAll.called,
    "THEN findAll should be called on the model"
  );
  t.true(AgentStub.findAll.calledOnce, "THEN findAll should be called once");
  t.deepEqual(agent, all, "THEN agent should be the same element");
});

ava.serial("GIVEN an Agent and method findConnected", async (t) => {
  let agent = await db.Agent.findConnected();
  t.true(AgentStub.findAll.called, "THEN findAll should be called on model");
  t.true(AgentStub.findAll.calledOnce, "THEN findAll should be called once");
  t.deepEqual(agent, connected, "THEN agent should be the same element");
});

ava.serial("GIVEN an Agent and method findByUsername", async (t) => {
  let agent = await db.Agent.findByUsername(usernameHelper);
  t.true(AgentStub.findAll.called, "THEN findAll should be called on model");
  t.true(AgentStub.findAll.calledOnce, "THEN findAll should be called once");
  t.true(
    AgentStub.findAll.calledWith({ where: { username: usernameHelper } }),
    "THEN findAll should be called with the same args"
  );
  t.deepEqual(
    agent,
    agentFixtures.byUsername(usernameHelper),
    "THEN agent should be the same element"
  );
});

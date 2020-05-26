const agentFixtures = require("./agent");

module.exports = function metricFixtures() {
  const single = { type: "agent", value: agentFixtures.single };
  const metrics = agentFixtures.all.map((agent) => ({
    type: "agent",
    value: agent,
  }));
  const oneByUuid = () =>
    agentFixtures.all.filter((f) => f.uuid === uuid).shift();
  const allByUuid = () => agentFixtures.all.filter((f) => f.uuid === uuid);
  return { single, all: metrics, oneByUuid, allByUuid };
};

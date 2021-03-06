"use strict";
module.exports = function setupAgent(AgentModel) {
  function findById(id) {
    return AgentModel.findById(id);
  }

  function findByUuid(uuid) {
    return AgentModel.findOne({ where: { uuid } });
  }

  function findAll() {
    return AgentModel.findAll();
  }

  function findConnected() {
    return AgentModel.findAll({ where: { connected: true } });
  }

  function findByUsername(username) {
    return AgentModel.findAll({ where: { username } });
  }

  async function createOrUpdate(agent) {
    const query = {
      where: {
        uuid: agent.uuid,
      },
    };
    const existingAgent = await AgentModel.findOne(query);
    if (existingAgent) {
      try {
        await AgentModel.update(agent, query);
        return AgentModel.findOne(query);
      } catch (error) {
        return existingAgent;
      }
    }
    const result = await AgentModel.create(agent);
    return result.toJSON();
  }
  return {
    findById,
    findByUuid,
    findAll,
    findConnected,
    findByUsername,
    createOrUpdate,
  };
};

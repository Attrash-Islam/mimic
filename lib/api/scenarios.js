import { PersistentStorage } from './storage';
import { Scenario } from './models/scenario';
import MockedRequests from './mocked-requests';

export class Scenarios {

  constructor() {
    this.loadFromStorage();
  }

  loadFromStorage() {
    this.scenarios = PersistentStorage.dataTree.scenarios
      .map((scenario) => new Scenario(scenario));

    PersistentStorage.dataTree.scenarios = this.scenarios;

    this.setCurrentScenario(PersistentStorage.dataTree.currentScenario);
  }

  setCurrentScenario(scenarioId) {
    this.currentScenario = scenarioId;

    PersistentStorage.dataTree.currentScenario = scenarioId;
    PersistentStorage.persist();
  }

  getCurrentScenario() {
    if (this.currentScenario === 'MockedRequests') {
      // TODO: Implement special case for mocked requests
      return {};
    }

    return this.getById(this.currentScenario);
  }

  getCurrentMockedRequests() {
    if (!this.getCurrentScenario()) {
      return [];
    }

    return this.getCurrentScenario().mockedRequests.map((request) => {
      return MockedRequests.mockedRequests
        .filter((_request) => _request.id === request.mockedRequestId)[0]
    });
  }

  getById(scenarioId) {
    return this.scenarios.filter((scenario) => scenario.id === scenarioId)[0];
  }

  addMockedRequestToScenario(scenarioId, mockedRequestId) {
    this.getById(scenarioId).addMockedRequest(mockedRequestId);

    PersistentStorage.persist();
  }

  addScenario(name) {
    this.scenarios.push(new Scenario({ name }));

    PersistentStorage.persist();
  }

  renameScenario(scenarioId, newName) {
    this.getById(scenarioId).rename(newName);

    PersistentStorage.persist();
  }

  duplicateScenario(scenarioId) {
    const selectedScenario = this.getById(scenarioId);

    const newScenario = {
      name: `${ selectedScenario.name } copy`,
      mockedRequests: selectedScenario.mockedRequests,
    };

    this.scenarios.push(new Scenario(newScenario));

    PersistentStorage.persist();
  }

  removeScenario(scenarioId) {
    const filtered = this.scenarios
      .filter((scenario) => scenario.id !== scenarioId);

    this.scenarios.splice(0, this.scenarios.length);

    filtered.forEach((scenario) => this.scenarios.push(scenario));

    PersistentStorage.persist();
  }

  updateRuleInScenario(scenarioId, ruleId, request, response) {
    this.getById(scenarioId).updateRule(ruleId, request, response);

    PersistentStorage.persist();
  }
}

export default new Scenarios();
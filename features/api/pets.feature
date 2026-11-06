Feature: API Pets

  @toDo
  Scenario: Get All Pets
    When Alice makes a GET request to "http://localhost:3000/pets"
    Then she should receive a response with code 200
    And she should receive a response with content type "application/json"

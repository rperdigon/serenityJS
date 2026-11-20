Feature: Chat
    Chat feature using the herokuapp website

  Background:
    Given Alice go to web "https://the-internet.herokuapp.com/chat"

  @toDo
  Scenario Outline: Using username and password to log in
    The herokuapp provides a simple example of form based authentication
    In order to get access to the protected resource
    As a user with the correct credentials
    I'd like to be able to log in using my username and password

    Then check to "Chat" has loaded
    Then verify the text element "Room" include "lobby"
    When send text "Test" into "Name"
    And click on "Join"
    Then verify the element "Message" is "visible"
    Then verify the text element "Message" is "Test joined"
    When send text "message 1" into "Message box"
    When click on "Send"
    Then verify the text element "User message" include "message 1"

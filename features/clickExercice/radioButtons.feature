Feature: Radio buttons
    Click on radio buttons in the page using the element selector

  Background:
    Given Alice go to web "https://the-internet.herokuapp.com/radio_buttons"

  Scenario Outline: Using username and password to log in
    The herokuapp provides a simple example of form based authentication
    In order to get access to the protected resource
    As a user with the correct credentials
    I'd like to be able to log in using my username and password

    Then check to "Radio Buttons" has loaded
    When select radio button "Green"
    Then verify the text element "message" include "green"
    When select radio button "Football"
    Then verify the text element "message" include "football"

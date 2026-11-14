Feature: Form-based authentication
  In order to learn how to use Serenity/JS with Cucumber and Playwright
  As a Curious Developer
  I'd like to see an example

  Background:
    Given Alice go to web "https://the-internet.herokuapp.com/basic_auth"

  @toDo @basicAuth
  Scenario Outline: Using username and password to log in
    The herokuapp provides a simple example of form based authentication
    In order to get access to the protected resource
    As a user with the correct credentials
    I'd like to be able to log in using my username and password

    Then check to "Basic Auth" has loaded
    Then verify the text element "message" include "Congratulations! You must have the proper credentials."

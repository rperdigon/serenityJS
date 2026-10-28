Feature: Form-based authentication
  In order to learn how to use Serenity/JS with Cucumber and Playwright
  As a Curious Developer
  I'd like to see an example

  Background:
    Given Alice go to web "https://the-internet.herokuapp.com/login"

  @toDo
  Scenario Outline: Using username and password to log in
    ["The Internet"](https://the-internet.herokuapp.com/) is an example application
    that captures prominent and ugly functionality found on the web.
    Perfect for writing automated acceptance tests against 😎
    With **Serenity/JS** you can use [Markdown](https://en.wikipedia.org/wiki/Markdown)
    to better describe each `Feature` and `Scenario`.

    Then check to "Login" has loaded
    When she logs in using "<username>" and "<password>"
    Then check to "Secure Area" has loaded
    Then verify the text element "advice" include "You logged into a secure area!"
    Then verify the text element "welcome message" is "Welcome to the Secure Area. When you are done click logout below."
    Then verify the text element "welcome message" is "Welcome to the Secure Area. When you are done click logout below."

    Examples:
      | username | password             | outcome   |
      | tomsmith | SuperSecretPassword! | succeeded |
  # Scenario Outline: Using username and password to log in
  #   ["The Internet"](https://the-internet.herokuapp.com/) is an example application
  #   that captures prominent and ugly functionality found on the web.
  #   Perfect for writing automated acceptance tests against 😎
  #   With **Serenity/JS** you can use [Markdown](https://en.wikipedia.org/wiki/Markdown)
  #   to better describe each `Feature` and `Scenario`.
  #   Then check to "Login" has loaded
  #   When she logs in using "<username>" and "<password>"
  #   Then she should see that authentication has <outcome>
  #   Examples:
  #     | username | password | outcome |
  #     | foobar   | barfoo   | failed  |

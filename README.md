# survey-options

[![Build Status](https://travis-ci.org/com.jessitron/survey-options.svg?branch=master)](https://travis-ci.org/com.jessitron/survey-options)
[![Slack Status](https://join.atomist.com/badge.svg)](https://join.atomist.com)

This project contains a [Spring Boot][boot] [REST][rest] service for "Supply list of options for a survey".

Jess is going to use it in a demo. This service should be available at https://survey.atomist.com/surveyOptions?seed=123

This should return JSON containing options, each with an imageLocation (URL to a kitty picture) and text (describing it).


[boot]: https://projects.spring.io/spring-boot/
[rest]: https://en.wikipedia.org/wiki/Representational_state_transfer

## Development

This project is driven using [Maven][mvn].  You will need to install
Maven locally to build, run, and test this project.

[mvn]: https://maven.apache.org/

### Run locally

You can run the service locally using the following from the command:

```
$ mvn spring-boot:run
```

### Run tests

This service comes with some rudimentary tests as a good starting
point for writing your own.  Use the following command to execute the
tests using Maven:

```
$ mvn test
```

---
Created by [Atomist][atomist].
Need Help?  [Join our Slack team][slack].

[atomist]: https://www.atomist.com/
[slack]: https://join.atomist.com/
 

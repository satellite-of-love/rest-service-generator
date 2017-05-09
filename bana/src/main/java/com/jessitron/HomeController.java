package com.jessitron;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @RequestMapping(path = "/")
    public String home() {
        return "Hello REST Microservice World";
    }
    // you can add a REST endpoint with `@atomist add endpoint` in this project's slack channel
}

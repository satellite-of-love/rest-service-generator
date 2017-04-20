package com.atomist.addrestendpoint;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class OneEndpointController {

    @CrossOrigin()
    @RequestMapping(path = "/onePath")
    public OneEndpoint oneEndpoint(@RequestParam(value = "oneParam") String oneParam) {
        System.out.println ("IN CONTROLLER");
        return new OneEndpoint(oneParam);
    }
}
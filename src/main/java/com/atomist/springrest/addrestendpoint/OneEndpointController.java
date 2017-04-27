package com.atomist.springrest.addrestendpoint;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class OneEndpointController {

    @CrossOrigin(origins = "http://localhost:8000")
    @RequestMapping(path = "/onePath")
    public OneEndpoint oneEndpoint(@RequestParam(value = "oneParam") String oneParam) {
        return new OneEndpoint(oneParam);
    }
}
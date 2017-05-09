package com.jessitron;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MushController {

    @CrossOrigin()
    @RequestMapping(path = "/mush")
    public Mush mush(@RequestParam(value = "squich") String squich) {
        return new Mush(squich);
    }
}

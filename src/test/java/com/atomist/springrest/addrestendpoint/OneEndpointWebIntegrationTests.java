package com.atomist.addrestendpoint;

import com.atomist.springrest.SpringRestApplication;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.beans.factory.annotation.Autowired;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

@RunWith(SpringJUnit4ClassRunner.class)
@SpringBootTest(classes = SpringRestApplication.class, webEnvironment = WebEnvironment.RANDOM_PORT)
public class OneEndpointWebIntegrationTests {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    public void oneEndpointTest() {
        // why do I not get a damn 404 when the endpoint doesn't exist ???!?!?!?!?>?!?
        // I'm deep in troubleshooting of "why doesn't this test work"
        // but another layer in now, on "why doesn't this test fail (sooner)"
        // in familiarity pain about Spring
        // TODO: ask someone
        OneEndpoint result = restTemplate.getForObject("/onePath", OneEndpoint.class);
        System.out.println("how did I even get this? " + result);
        assertEquals("hello", result.getOneParam());
    }
}
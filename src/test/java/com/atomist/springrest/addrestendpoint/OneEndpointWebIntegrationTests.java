package com.atomist.springrest.addrestendpoint;

import com.atomist.springrest.SpringRestApplication;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

        String oneParam = "123";

        ResponseEntity<OneEndpoint> result =
                restTemplate.getForEntity(
                        "/onePath?oneParam={_}",
                        OneEndpoint.class,
                        oneParam);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertEquals(oneParam, result.getBody().getOneParam());
    }
}
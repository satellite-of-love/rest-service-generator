package com.jessitron;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import com.jessitron.Mush;

@RunWith(SpringJUnit4ClassRunner.class)
@SpringBootTest(classes = BanaApplication.class, webEnvironment = WebEnvironment.RANDOM_PORT)
public class BanaWebIntegrationTests {

    // Use this to run tests
    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    public void sampleTest() {
        ResponseEntity<String> result = restTemplate.getForEntity("/", String.class);
        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertTrue(result.getBody().contains("Hello"));
    }

@Test
    public void mushTest() {
        String squich = "123";
        ResponseEntity<Mush> result = restTemplate.getForEntity("/mush?squich={_}", Mush.class, squich);
        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertEquals(squich, result.getBody().getSquich());
    }}

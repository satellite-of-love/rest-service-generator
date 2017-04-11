package com.jessitron;

import com.jessitron.survey.SurveyOptions;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.web.client.RestTemplate;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

@RunWith(SpringJUnit4ClassRunner.class)
@SpringBootTest(classes = SurveyOptionsApplication.class, webEnvironment = WebEnvironment.DEFINED_PORT)
public class SurveyOptionsWebIntegrationTests {

    private static final int PORT = 8080;

    // Parameterize tests like this
    private static final String BASE_PATH = "http://localhost:" + PORT;

    // Use this to run tests
    private RestTemplate restTemplate = new RestTemplate();

    @Test
    public void sampleTest() {
        String result = restTemplate.getForObject(BASE_PATH, String.class);
        System.out.println(result);
        assertTrue(result.contains("Hello"));
    }

    @Test
    public void optionsTest() {
        int count = 2; // todo: how can I use a URI template to populate this?
        int seed = 123;
        SurveyOptions result = restTemplate.getForObject(BASE_PATH + "/surveyOptions?seed=123&count=2", SurveyOptions.class);
        assertEquals(count, result.getOptions().size());
        assertEquals(seed, result.getSeed());
    }

}

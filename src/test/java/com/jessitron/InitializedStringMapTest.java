package com.jessitron;

import org.junit.Test;

import java.util.Map;

import static org.junit.Assert.*;

public class InitializedStringMapTest {

    @Test
    public void testMapConstruction() {
        Map<String,String> result = InitializedStringMap.mapOf("a", "armadillo", "b", "banana");
        assertEquals(2, result.size());
        assertEquals(result.get("a"), "armadillo");
        assertEquals(result.get("b"), "banana");
    }

}
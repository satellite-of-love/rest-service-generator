package com.jessitron;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.IntStream;
import java.util.stream.Stream;

/* todo: this is a microlibrary */
public class InitializedStringMap {

    static Map<String, String> mapOf(String... things) {
        Map<String, String> output = new HashMap<>();
        apportion(things, 2).forEach(pair -> output.put(pair[0], pair[1]));
        return output;
    }
    private static <T> Stream<T[]> apportion(T[] things, int size) {
        if (things.length % size != 0) {
            throw new IllegalArgumentException(String.format("Array of length %d is not divisible by %d", things.length, size));
        }
        int outputSize = things.length / size;
        if(size > things.length)
            return Stream.empty();
        return IntStream.range(0, outputSize)
                .mapToObj(i -> Arrays.copyOfRange(things, i * outputSize, (i + 1) * outputSize));
    }
}

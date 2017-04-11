package com.jessitron.survey;

import java.util.List;

public class SurveyOptions {

    private int seed;

    public void setSeed(int seed) {
        this.seed = seed;
    }

    public void setCount(int count) {
        this.count = count;
    }

    public void setOptions(List<SurveyOption> options) {
        this.options = options;
    }

    private int count;
    private List<SurveyOption> options;

    public int getSeed() {
        return seed;
    }

    public int getCount() {
        return count;
    }

    public List<SurveyOption> getOptions() {
        return options;
    }

    public SurveyOptions(int seed, int count, List<SurveyOption> options) {
        this.seed = seed;
        this.count = count;

        this.options = options;
    }

    public SurveyOptions() {}
}

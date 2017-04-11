package com.jessitron.survey;

public class SurveyOption {

    private String imageLocation;
    private String text;

    public void setImageLocation(String imageLocation) {
        this.imageLocation = imageLocation;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getImageLocation() {
        return imageLocation;
    }

    public String getText() {
        return text;
    }

    public SurveyOption(String imageLocation, String text) {
        this.imageLocation = imageLocation;
        this.text = text;

    }

    public SurveyOption() {}
}

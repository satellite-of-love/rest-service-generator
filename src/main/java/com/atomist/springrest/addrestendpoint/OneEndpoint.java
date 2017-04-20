package com.atomist.addrestendpoint;

public class OneEndpoint {

    public OneEndpoint() {} // default constructor for deserialization

    public String oneParam;

    public String getOneParam() {
        return oneParam;
    }

    public void setOneParam(String oneParam) {
        this.oneParam = oneParam;
    }

    public OneEndpoint(String oneParam) {
        this.oneParam = oneParam;
    }
}

package com.kdu.busboridriver;

public class BusButton {
    private String assort;
    private String buttonText;
    private String destination;
    private String time;
    private String type;

    public BusButton(String assort, String buttonText, String destination, String time, String type) {
        this.assort = assort;
        this.buttonText = buttonText;
        this.destination = destination;
        this.time = time;
        this.type = type;
    }

    public String getAssort() {
        return assort;
    }
    public String getButtonText() {
        return buttonText;
    }

    public String getDestination() {
        return destination;
    }

    public String getTime() {
        return time;
    }

    public String getType() {
        return type;
    }
}
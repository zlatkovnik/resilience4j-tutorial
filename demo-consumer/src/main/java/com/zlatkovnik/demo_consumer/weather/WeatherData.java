package com.zlatkovnik.demo_consumer.weather;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class WeatherData {
    private String city;
    private String temperature;
    private Double hour;
    private Boolean withError;
}

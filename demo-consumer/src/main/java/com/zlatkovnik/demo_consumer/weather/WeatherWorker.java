package com.zlatkovnik.demo_consumer.weather;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class WeatherWorker {

    private final List<WeatherData> resilienceList = Collections.synchronizedList(new ArrayList<>());
    private final List<WeatherError> resilienceErrorList = Collections.synchronizedList(new ArrayList<>());

    private final List<WeatherData> regularList = Collections.synchronizedList(new ArrayList<>());
    private final List<WeatherError> regularErrorList = Collections.synchronizedList(new ArrayList<>());


    @Value("${consumer.url}")
    private String consumerUrl;

    private final WeatherService weatherService;
    private final WeatherDataExporterService weatherDataExporterService;

    @PostConstruct()
    private void init() {
        weatherDataExporterService.initPath("resilience-weather.csv");
        weatherDataExporterService.initPath("resilience-error.csv");
        weatherDataExporterService.initPath("regular-weather.csv");
        weatherDataExporterService.initPath("regular-error.csv");
    }

    @Scheduled(fixedDelay = 500)
    public void resilienceWork() {
        WeatherData data = weatherService.fetchWeatherResilience(consumerUrl);
        if (data != null) {
            if (Boolean.TRUE.equals(data.getWithError())) {
                resilienceErrorList.add(new WeatherError(weatherService.getSimulatedHour(LocalTime.now())));
            } else {
                resilienceList.add(data);
            }
        }
    }

    @Scheduled(fixedDelay = 500)
    public void regularWork() {
        WeatherData data = weatherService.fetchWeatherRegular(consumerUrl);
        if (data != null) {
            regularList.add(data);
        } else {
            regularErrorList.add(new WeatherError(weatherService.getSimulatedHour(LocalTime.now())));
        }
    }

    @Scheduled(fixedDelay = 5000)
    public void flushToCSV() {
        weatherDataExporterService.exportToCSV("resilience-weather.csv", resilienceList);
        weatherDataExporterService.exportErrorsToCSV("resilience-error.csv", resilienceErrorList);

        weatherDataExporterService.exportToCSV("regular-weather.csv", regularList);
        weatherDataExporterService.exportErrorsToCSV("regular-error.csv", regularErrorList);
    }
}

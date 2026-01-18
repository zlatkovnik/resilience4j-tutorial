package com.zlatkovnik.demo_consumer.weather;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalTime;
import java.util.concurrent.atomic.AtomicReference;

@Service
@Slf4j
public class WeatherService {

    private RestTemplate restTemplate;

    @PostConstruct
    private void init() {
        restTemplate = new RestTemplate();
    }

    @CircuitBreaker(name = "weatherPoll", fallbackMethod = "fallback")
    public WeatherData fetchWeatherResilience(String url) {
        return restTemplate.getForObject(url + "/weather/Niš", WeatherData.class);
    }

    public WeatherData fallback(Throwable t) {
        if (t instanceof HttpServerErrorException) {
            var data = new WeatherData();
            data.setWithError(true);
            return data;
        }
        return null;
    }

    public WeatherData fetchWeatherRegular(String url) {
        WeatherData data;
        try {
            data = restTemplate.getForObject(url + "/weather/Niš", WeatherData.class);
        } catch (Exception exception) {
            return null;
        }
        return data;
    }


    public Double getSimulatedHour(LocalTime time) {
        int seconds = time.getSecond();
        int millis = time.getNano() / 1_000_000;
        double totalSeconds = seconds + (millis / 1000.0);
        return (totalSeconds / 60.0) * 24.0;
    }
}
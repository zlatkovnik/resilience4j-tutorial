package com.zlatkovnik.demo_consumer.weather;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;

@RestController
public class WeatherController {
    @GetMapping("/api/weather/resilience")
    public ResponseEntity<Resource> downloadResilienceCsv() {
        String path = System.getProperty("user.dir") + File.separator + "resilience-weather.csv";
        File file = new File(path);

        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new FileSystemResource(file);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=resilience-weather.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(resource);
    }

    @GetMapping("/api/weather/regular")
    public ResponseEntity<Resource> downloadRegularCsv() {
        String path = System.getProperty("user.dir") + File.separator + "regular-weather.csv";
        File file = new File(path);

        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new FileSystemResource(file);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=regular-weather.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(resource);
    }

    @GetMapping("/api/weather/error/resilience")
    public ResponseEntity<Resource> downloadResilienceErrorCsv() {
        String path = System.getProperty("user.dir") + File.separator + "resilience-error.csv";
        File file = new File(path);

        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new FileSystemResource(file);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=resilience-error.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(resource);
    }

    @GetMapping("/api/weather/error/regular")
    public ResponseEntity<Resource> downloadRegularCSV() {
        String path = System.getProperty("user.dir") + File.separator + "regular-error.csv";
        File file = new File(path);

        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new FileSystemResource(file);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=regular-error.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(resource);
    }
}

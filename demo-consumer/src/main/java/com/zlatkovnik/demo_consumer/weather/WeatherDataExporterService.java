package com.zlatkovnik.demo_consumer.weather;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class WeatherDataExporterService {

    private String absoluteBasePath;

    @PostConstruct
    public void initialize() {
        String projectRoot = System.getProperty("user.dir");
        this.absoluteBasePath = projectRoot + File.separator;
    }

    public void initPath(String fileName) {
        var absoluteCsvPath = absoluteBasePath + fileName;

        Path path = Paths.get(absoluteCsvPath);

        try {
            try (PrintWriter pw = new PrintWriter(Files.newBufferedWriter(path))) {
                pw.println("City,Hour,Temperature");
                pw.flush();
            }

        } catch (IOException e) {
            log.error("Failed to initialize weather CSV file: {}", e.getMessage());
        }
    }

    public void exportToCSV(String fileName, List<WeatherData> list) {
        if (list.isEmpty()) return;

        log.info("Flushing {} records to CSV...", list.size());

        List<WeatherData> toWrite;
        synchronized (list) {
            toWrite = new ArrayList<>(list);
            list.clear();
        }

        try (FileWriter fw = new FileWriter(absoluteBasePath + fileName, true);
             PrintWriter pw = new PrintWriter(fw)) {

            for (WeatherData data : toWrite) {
                pw.printf("%s,%.2f,%s%n",
                        data.getCity(),
                        data.getHour(),
                        data.getTemperature());
            }
            log.info("Successfully wrote to {}", absoluteBasePath);
        } catch (IOException e) {
            log.error("CSV Write Error: {}", e.getMessage());
        }
    }

    public void exportErrorsToCSV(String fileName, List<WeatherError> list) {
        if (list.isEmpty()) return;

        log.info("Flushing {} records to CSV...", list.size());

        List<WeatherError> toWrite;
        synchronized (list) {
            toWrite = new ArrayList<>(list);
            list.clear();
        }

        try (FileWriter fw = new FileWriter(absoluteBasePath + fileName, true);
             PrintWriter pw = new PrintWriter(fw)) {

            for (WeatherError data : toWrite) {
                pw.printf("%.2f%n",
                        data.getTime());
            }
            log.info("Successfully wrote to {}", absoluteBasePath);
        } catch (IOException e) {
            log.error("CSV Write Error: {}", e.getMessage());
        }
    }
}

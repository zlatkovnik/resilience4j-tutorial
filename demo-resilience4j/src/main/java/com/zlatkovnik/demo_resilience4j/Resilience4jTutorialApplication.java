package com.zlatkovnik.demo_resilience4j;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class Resilience4jTutorialApplication {

	public static void main(String[] args) {
		SpringApplication.run(Resilience4jTutorialApplication.class, args);
	}

}

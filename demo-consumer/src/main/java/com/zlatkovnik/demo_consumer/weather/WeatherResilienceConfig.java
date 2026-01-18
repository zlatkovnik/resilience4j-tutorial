package com.zlatkovnik.demo_consumer.weather;

import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Configuration
public class WeatherResilienceConfig {
    @Bean
    public CircuitBreakerRegistry circuitBreakerRegistry() {
        CircuitBreakerConfig customConfig = CircuitBreakerConfig.custom()
                .failureRateThreshold(50)
                .slidingWindowSize(1)
                .minimumNumberOfCalls(1)
                .waitDurationInOpenState(Duration.ofSeconds(10))
                .recordExceptions(Throwable.class)
                .build();

        CircuitBreakerRegistry registry = CircuitBreakerRegistry.of(customConfig);

        registry.circuitBreaker("weatherPoll", customConfig);

        return registry;
    }
}

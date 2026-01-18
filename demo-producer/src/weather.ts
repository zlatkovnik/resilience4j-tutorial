import express, { NextFunction, Router } from 'express';
import { chaosMiddleware } from './chaos.middleware';
import { Perlin1D } from './perlin1d';

const weatherRouter: Router = express.Router();

const perlin = new Perlin1D();
// Apply chaos middleware BEFORE routes
weatherRouter.use(chaosMiddleware);

weatherRouter.get('/:city', (req, res) => {
    const { city } = req.params;
    const simulatedHour = getSimulatedHour(new Date());
    const temp = mapToTemperatureRange(getNoisyCycle(simulatedHour));
    res.json({ city, temperature: temp, hour: simulatedHour.toFixed(2) });
});

function getSimulatedHour(date: Date): number {
    const seconds = date.getSeconds();
    const millis = date.getMilliseconds();
    const totalSeconds = seconds + millis / 1000;
    return (totalSeconds / 60) * 24;
}

function getNoisyCycle(time: number): number {
    const period = 24;
    const peak = 12;
    const t = time % period;
    const baseSlope = 1 - Math.abs((t / peak) - 1);
    const noiseValue = perlin.noise(time * 0.2) * 0.15;

    return Math.max(0, baseSlope + noiseValue);
}

function mapToTemperatureRange(normalized: number): number {
    return normalized * 20 - 5;
}

export default weatherRouter;
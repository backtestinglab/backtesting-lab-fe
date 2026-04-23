import { calculateDrawdown } from './drawdownCalculator';

describe('calculateDrawdown', () => {
  const mockChartData = [
    { time: 1609459200, open: 100, high: 105, low: 98, close: 102 },
    { time: 1609462800, open: 102, high: 108, low: 99, close: 106 },
    { time: 1609466400, open: 106, high: 110, low: 104, close: 109 },
    { time: 1609470000, open: 109, high: 112, low: 107, close: 111 },
  ];

  describe('bullish predictions', () => {
    test('calculates negative drawdown for correct bullish prediction', () => {
      const prediction = {
        timestamp: 1609459200,
        predictedBias: 'bullish',
        accuracy: 1,
        priceAtPrediction: 102,
      };

      const drawdown = calculateDrawdown(prediction, mockChartData);

      // Validation candle: time 1609462800, low: 99
      // Drawdown = ((99 - 102) / 102) * 100 = -2.94%
      expect(drawdown).toBeCloseTo(-2.94, 2);
    });

    test('returns null for incorrect bullish prediction', () => {
      const prediction = {
        timestamp: 1609459200,
        predictedBias: 'bullish',
        accuracy: 0,
        priceAtPrediction: 102,
      };

      const drawdown = calculateDrawdown(prediction, mockChartData);
      expect(drawdown).toBeNull();
    });
  });

  describe('bearish predictions', () => {
    test('calculates positive drawdown for correct bearish prediction', () => {
      const prediction = {
        timestamp: 1609459200,
        predictedBias: 'bearish',
        accuracy: 1,
        priceAtPrediction: 102,
      };

      const drawdown = calculateDrawdown(prediction, mockChartData);

      // Validation candle: time 1609462800, high: 108
      // Drawdown = ((108 - 102) / 102) * 100 = +5.88%
      expect(drawdown).toBeCloseTo(5.88, 2);
    });

    test('returns null for incorrect bearish prediction', () => {
      const prediction = {
        timestamp: 1609459200,
        predictedBias: 'bearish',
        accuracy: 0,
        priceAtPrediction: 102,
      };

      const drawdown = calculateDrawdown(prediction, mockChartData);
      expect(drawdown).toBeNull();
    });
  });

  describe('neutral predictions', () => {
    test('returns null for neutral predictions (no directional drawdown)', () => {
      const prediction = {
        timestamp: 1609459200,
        predictedBias: 'neutral',
        accuracy: 1,
        priceAtPrediction: 102,
      };

      const drawdown = calculateDrawdown(prediction, mockChartData);
      expect(drawdown).toBeNull();
    });
  });

  describe('edge cases', () => {
    test('returns null when prediction timestamp not found in chartData', () => {
      const prediction = {
        timestamp: 9999999999,
        predictedBias: 'bullish',
        accuracy: 1,
        priceAtPrediction: 102,
      };

      const drawdown = calculateDrawdown(prediction, mockChartData);
      expect(drawdown).toBeNull();
    });

    test('returns null when prediction is on last candle (no next candle)', () => {
      const prediction = {
        timestamp: 1609470000, // Last candle in mockChartData
        predictedBias: 'bullish',
        accuracy: 1,
        priceAtPrediction: 111,
      };

      const drawdown = calculateDrawdown(prediction, mockChartData);
      expect(drawdown).toBeNull();
    });

    test('returns null for empty chartData', () => {
      const prediction = {
        timestamp: 1609459200,
        predictedBias: 'bullish',
        accuracy: 1,
        priceAtPrediction: 102,
      };

      const drawdown = calculateDrawdown(prediction, []);
      expect(drawdown).toBeNull();
    });

    test('returns null when chartData is undefined', () => {
      const prediction = {
        timestamp: 1609459200,
        predictedBias: 'bullish',
        accuracy: 1,
        priceAtPrediction: 102,
      };

      const drawdown = calculateDrawdown(prediction, undefined);
      expect(drawdown).toBeNull();
    });
  });
});

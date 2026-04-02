import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { predictFromFrontendStats, checkHealth, FrontendGameStats } from './api';

const mockStats: FrontendGameStats = {
  cloudport_totalTime: 30,
  cloudport_avgReactionTime: 350,
  cloudport_catches: 8,
  cloudport_misses: 2,
  starBridge_totalTime: 45,
  starBridge_errors: 1,
  starBridge_completed: true,
  hiddenReef_totalMoves: 20,
  hiddenReef_totalPairs: 8,
  hiddenReef_efficiency: 0.6,
  hiddenReef_roundsCompleted: 2,
  echoBay_maxSequence: 5,
  echoBay_totalRounds: 4,
  echoBay_perfectRounds: 2,
};

const mockPrediction = {
  predicted_class: 1,
  performance_label: 'Average performance',
  risk_band: 'Low',
  recommendation: 'Normal range - continue monitoring',
  confidence: 0.72,
  mean_z_score: 0.1,
  probabilities: { High: 0.2, Average: 0.72, 'Below avg': 0.06, 'At-risk': 0.02 },
  zscores: {},
  raw_features: {},
};

describe('api.ts', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('predictFromFrontendStats', () => {
    it('POSTs to the correct endpoint with JSON body', async () => {
      const fetchMock = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockPrediction,
      });
      vi.stubGlobal('fetch', fetchMock);

      await predictFromFrontendStats(mockStats);

      expect(fetchMock).toHaveBeenCalledOnce();
      const [url, options] = fetchMock.mock.calls[0];
      expect(url).toBe('http://localhost:8001/api/predict/frontend');
      expect(options.method).toBe('POST');
      expect(options.headers['Content-Type']).toBe('application/json');
      expect(JSON.parse(options.body)).toMatchObject({ cloudport_catches: 8 });
    });

    it('returns the parsed prediction result', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockPrediction,
      }));

      const result = await predictFromFrontendStats(mockStats);
      expect(result.predicted_class).toBe(1);
      expect(result.performance_label).toBe('Average performance');
      expect(result.confidence).toBeCloseTo(0.72);
    });

    it('throws when response is not ok', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
      }));

      await expect(predictFromFrontendStats(mockStats)).rejects.toThrow(
        'Prediction failed: 503 Service Unavailable'
      );
    });

    it('throws on network failure', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new Error('Network error')));
      await expect(predictFromFrontendStats(mockStats)).rejects.toThrow('Network error');
    });
  });

  describe('checkHealth', () => {
    it('returns true when status=ok and models_loaded=true', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
        json: async () => ({ status: 'ok', models_loaded: true }),
      }));

      const result = await checkHealth();
      expect(result).toBe(true);
    });

    it('returns false when models_loaded=false', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
        json: async () => ({ status: 'ok', models_loaded: false }),
      }));

      const result = await checkHealth();
      expect(result).toBe(false);
    });

    it('returns false when status is not ok', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
        json: async () => ({ status: 'error', models_loaded: true }),
      }));

      const result = await checkHealth();
      expect(result).toBe(false);
    });

    it('returns false on network failure (does not throw)', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new Error('Network error')));
      const result = await checkHealth();
      expect(result).toBe(false);
    });

    it('calls the correct health endpoint', async () => {
      const fetchMock = vi.fn().mockResolvedValueOnce({
        json: async () => ({ status: 'ok', models_loaded: true }),
      });
      vi.stubGlobal('fetch', fetchMock);

      await checkHealth();
      expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:8001/api/health');
    });
  });
});

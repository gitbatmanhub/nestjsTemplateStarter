import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('returns an ok payload', () => {
    const controller = new HealthController();
    const response = controller.check();

    expect(response.status).toBe('ok');
    expect(response.service).toBe('nestjs-complete-starter');
    expect(response.timestamp).toBeDefined();
  });
});

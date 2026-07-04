import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';
import { Reflector } from '@nestjs/core';

describe('Asset Flow E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let employeeToken: string;
  let managerAToken: string;
  let managerBToken: string;
  let adminToken: string;
  let auditorToken: string;
  let pendingAppId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new ResponseInterceptor(new Reflector()));
    await app.init();

    prisma = app.get(PrismaService);

    const login = async (username: string) => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username, password: '123456' });
      return res.body.data.token as string;
    };

    employeeToken = await login('employee_a');
    managerAToken = await login('manager_a');
    managerBToken = await login('manager_b');
    adminToken = await login('admin');
    auditorToken = await login('auditor');
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. normal approval flow', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/applications')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        reason: 'E2E测试申请',
        items: [
          {
            category: 'SENSITIVE_DATA',
            assetName: '测试资产',
            quantity: 2,
          },
        ],
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.data.status).toBe('PENDING');
    pendingAppId = createRes.body.data.id;

    const approveRes = await request(app.getHttpServer())
      .post(`/api/approvals/${pendingAppId}/approve`)
      .set('Authorization', `Bearer ${managerAToken}`);

    expect(approveRes.status).toBe(201);
    expect(approveRes.body.data.status).toBe('APPROVED');

    const audit = await prisma.auditLog.findFirst({
      where: { applicationId: pendingAppId, action: 'APPROVE' },
    });
    expect(audit).toBeTruthy();
    expect(audit?.beforeStatus).toBe('PENDING');
    expect(audit?.afterStatus).toBe('APPROVED');
  });

  it('2. employee cannot approve - 403', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/applications')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        reason: '越权测试',
        items: [{ category: 'ELECTRONIC_DEVICE', assetName: '电脑', quantity: 1 }],
      });

    const appId = createRes.body.data.id;
    const res = await request(app.getHttpServer())
      .post(`/api/approvals/${appId}/approve`)
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(res.status).toBe(403);
  });

  it('3. horizontal privilege escalation - manager_b approves rd dept - 403', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/applications')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        reason: '水平越权测试',
        items: [{ category: 'ELECTRONIC_DEVICE', assetName: '显示器', quantity: 1 }],
      });

    const appId = createRes.body.data.id;
    const res = await request(app.getHttpServer())
      .post(`/api/approvals/${appId}/approve`)
      .set('Authorization', `Bearer ${managerBToken}`);

    expect(res.status).toBe(403);
  });

  it('4. cannot approve already approved application', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/approvals/${pendingAppId}/approve`)
      .set('Authorization', `Bearer ${managerAToken}`);

    expect([400, 409]).toContain(res.status);
  });

  it('5. reject audit log completeness', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/applications')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        reason: '驳回测试',
        items: [{ category: 'ELECTRONIC_DEVICE', assetName: '键盘', quantity: 1 }],
      });

    const appId = createRes.body.data.id;
    const rejectReason = '不符合采购标准';

    await request(app.getHttpServer())
      .post(`/api/approvals/${appId}/reject`)
      .set('Authorization', `Bearer ${managerAToken}`)
      .send({ reason: rejectReason });

    const audit = await prisma.auditLog.findFirst({
      where: { applicationId: appId, action: 'REJECT' },
    });

    expect(audit).toBeTruthy();
    expect(audit?.reason).toBe(rejectReason);
    expect(audit?.beforeStatus).toBe('PENDING');
    expect(audit?.afterStatus).toBe('REJECTED');
    expect(audit?.operatorId).toBeTruthy();
  });

  it('6. assetKey masking in list response', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/applications/mine')
      .set('Authorization', `Bearer ${employeeToken}`);

    const sensitiveItem = res.body.data.list
      .flatMap((app: { items: { assetKey?: string }[] }) => app.items)
      .find((item: { assetKey?: string }) => item.assetKey?.includes('****'));

    expect(sensitiveItem).toBeTruthy();
    expect(sensitiveItem.assetKey).toMatch(/SEC-\*\*\*\*-./);
  });

  it('7. concurrent approve idempotency', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/applications')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        reason: '并发测试',
        items: [{ category: 'ELECTRONIC_DEVICE', assetName: '鼠标', quantity: 1 }],
      });

    const appId = createRes.body.data.id;

    const [res1, res2] = await Promise.all([
      request(app.getHttpServer())
        .post(`/api/approvals/${appId}/approve`)
        .set('Authorization', `Bearer ${managerAToken}`),
      request(app.getHttpServer())
        .post(`/api/approvals/${appId}/approve`)
        .set('Authorization', `Bearer ${managerAToken}`),
    ]);

    const statuses = [res1.status, res2.status].sort();
    expect(statuses).toEqual([201, 409]);
  });

  it('8. employee can withdraw pending application', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/applications')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        reason: '撤回测试',
        items: [{ category: 'ELECTRONIC_DEVICE', assetName: '耳机', quantity: 1 }],
      });

    const appId = createRes.body.data.id;
    const withdrawRes = await request(app.getHttpServer())
      .post(`/api/applications/${appId}/withdraw`)
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(withdrawRes.status).toBe(201);
    expect(withdrawRes.body.data.status).toBe('WITHDRAWN');

    const audit = await prisma.auditLog.findFirst({
      where: { applicationId: appId, action: 'WITHDRAW' },
    });
    expect(audit?.beforeStatus).toBe('PENDING');
    expect(audit?.afterStatus).toBe('WITHDRAWN');
  });

  it('9. admin can terminate pending application', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/applications')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        reason: '终止测试',
        items: [{ category: 'ELECTRONIC_DEVICE', assetName: '打印机', quantity: 1 }],
      });

    const appId = createRes.body.data.id;
    const terminateRes = await request(app.getHttpServer())
      .post(`/api/approvals/${appId}/terminate`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(terminateRes.status).toBe(201);
    expect(terminateRes.body.data.status).toBe('TERMINATED');
  });

  it('10. assetKey masking in audit logs API', async () => {
    await request(app.getHttpServer())
      .post('/api/applications')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        reason: '审计脱敏测试',
        items: [{ category: 'SENSITIVE_DATA', assetName: '数据库只读权限', quantity: 1 }],
      });

    const res = await request(app.getHttpServer())
      .get('/api/audit/logs?page=1&pageSize=50')
      .set('Authorization', `Bearer ${auditorToken}`);

    expect(res.status).toBe(200);
    const maskedLog = res.body.data.list.find(
      (log: { assetKey?: string | null }) =>
        log.assetKey != null && /SEC-\*\*\*\*-./.test(log.assetKey),
    );
    expect(maskedLog).toBeTruthy();
    expect(maskedLog.assetKey).not.toMatch(/SECRET_KEY/);
  });

  it('11. employee cannot access audit API - 403', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/audit/logs')
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(res.status).toBe(403);
  });
});

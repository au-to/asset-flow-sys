import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function ForbiddenPage() {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Result
        status="403"
        title="无权访问"
        subTitle="抱歉，您没有权限访问此页面。如需访问，请联系系统管理员。"
        extra={
          <Button type="primary" onClick={() => navigate('/application')}>
            返回首页
          </Button>
        }
      />
    </div>
  );
}

import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function ForbiddenPage() {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Result
        status="403"
        title="403"
        subTitle="抱歉，您无权访问此页面"
        extra={
          <Button type="primary" onClick={() => navigate('/application')}>
            返回首页
          </Button>
        }
      />
    </div>
  );
}

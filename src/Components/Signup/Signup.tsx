import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MailOutlined,
  LockOutlined,
  UserOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import styles from './Signup.module.css';
import { Button, Checkbox, Form, Input, Space, Spin, notification } from 'antd';

type NotificationType = 'success' | 'info' | 'warning' | 'error';

const Signup = ({ setSession }: any) => {
  const [loading, setLoading] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  const [form] = Form.useForm();

  const openNotificationWithIcon = (
    type: NotificationType,
    message: string,
    description: string
  ) => {
    api[type]({
      message,
      description,
    });
  };

  const validateMessages = {
    required: '${label} is required!',
    types: {
      email: '${label} format invalid!',
      password: '${label} is not validate password!',
      username: '${label} is not validate username!',
    },
    string: {
      min: '${label} must be at least ${min} characters',
      max: '${label} must be at most ${max} characters',
      range: '${label} must be between ${min} and ${max} characters',
    },
  };

  const onFinish = async (values: any) => {
    console.log(values);
    const graphql = JSON.stringify({
      query: `mutation Signup {
        signup(signupInput: {
            email: "${values.Email}",
            username: "${values.Username}"
            password: "${values.Password}"
          }) {
            token
            user {
              email,
              username,
              rol
            }
          }
        }`,
    });
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: graphql,
      });
      const data = await response.json();
      if (data.errors) {
        const errorMessage = data.errors[0].extensions.originalError.message;
        openNotificationWithIcon('error', 'Register error', errorMessage + '!');
        throw new Error(errorMessage);
      }
      setSession(data.data.signup, values.remember);
    } catch (error) {
      onFinishFailed(error);
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (_errorInfo: any) => {
    form.resetFields();
  };

  return (
    <>
      {contextHolder}
      <Spin
        indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
        spinning={loading}
      >
        <div className={styles.signup}>
          <h1>Register now!</h1>
          <div></div>
          <Form
            form={form}
            name="normal_login"
            className="login-form"
            size="large"
            initialValues={{ remember: true }}
            validateMessages={validateMessages}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
          >
            <Form.Item name="Email" rules={[{ required: true, type: 'email' }]}>
              <Input
                placeholder="Enter your email"
                prefix={<MailOutlined className="site-form-item-icon" />}
              />
            </Form.Item>

            <Form.Item
              name="Username"
              rules={[{ required: true, type: 'string', min: 3, max: 20 }]}
            >
              <Input
                placeholder="Enter your username"
                prefix={<UserOutlined className="site-form-item-icon" />}
              />
            </Form.Item>

            <Form.Item
              name="Password"
              rules={[{ required: true, type: 'string', min: 8 }]}
            >
              <Input.Password
                placeholder="Enter your password"
                prefix={<LockOutlined className="site-form-item-icon" />}
              />
            </Form.Item>

            <Form.Item>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Remember me</Checkbox>
              </Form.Item>
            </Form.Item>

            <Form.Item className={styles.fixWidth}>
              <Button
                type="primary"
                htmlType="submit"
                className="login-form-button"
              >
                Sign up
              </Button>{' '}
              already have an account?{' '}
              <Link className={styles.inline} to="/login">
                Login!
              </Link>
            </Form.Item>
          </Form>
        </div>
      </Spin>
    </>
  );
};

export default Signup;

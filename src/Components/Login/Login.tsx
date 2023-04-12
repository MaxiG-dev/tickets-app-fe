import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LockOutlined, MailOutlined, LoadingOutlined } from '@ant-design/icons';
import styles from './Login.module.css';
import { Button, Checkbox, Form, Input, Spin } from 'antd';

const Login = ({ setSession, openNotification }: any) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    const graphql = JSON.stringify({
      query: `mutation Login {
          login(loginInput: {
            email: "${values.Email}",
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
        openNotification('error', 'Login error', data.errors[0].message + '!');
        throw new Error(data.errors[0].message);
      }
      setSession(data.data.login, values.remember);
      openNotification(
        'success',
        'Login success',
        'Welcome back ' + data.data.login.user.username + '!'
      );
    } catch (error) {
      onFinishFailed(error);
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (_errorInfo: any) => {
    form.resetFields();
  };

  const validateMessages = {
    required: '${label} is required!',
    types: {
      email: '${label} format invalid!',
      password: '${label} is not validate password!',
    },
    string: {
      min: '${label} must be at least ${min} characters',
    },
  };

  return (
    <>
      <Spin
        indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
        spinning={loading}
      >
        <div className={styles.login}>
          <h1>Welcome back!</h1>
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
                Log in
              </Button>{' '}
              Or{' '}
              <Link className={styles.inline} to="/sign-up">
                register now!
              </Link>
            </Form.Item>
          </Form>
        </div>
      </Spin>
    </>
  );
};

export default Login;

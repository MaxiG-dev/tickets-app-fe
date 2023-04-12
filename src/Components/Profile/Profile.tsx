import { useState } from 'react';
import {
  LockOutlined,
  UserOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import styles from './Profile.module.css';
import { Button, Form, Input, Spin, notification } from 'antd';

type NotificationType = 'success' | 'info' | 'warning' | 'error';

const Profile = ({ userSession, setUser }: any) => {
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
    required: '${name} is required!',
    types: {
      email: '${name} format invalid!',
      password: '${name} is not validate password!',
      username: '${name} is not validate username!',
    },
    string: {
      min: '${name} must be at least ${min} characters',
      max: '${name} must be at most ${max} characters',
      range: '${name} must be between ${min} and ${max} characters',
    },
  };

  const onFinish = async (values: any) => {
    const graphql = JSON.stringify({
      query: `mutation UpdateUser {
        updateUser(updateUserInput: {
          email: "${userSession.user.email}",
          username: "${form.getFieldValue('Username')}",
          ${values.Password ? 'password: "' + values.Password + '"' : 'password: null'}
          }) {
            email,
            username,
            rol
          }
        }`,
    });
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + userSession.token,
        },
        body: graphql,
      });
      const data = await response.json();
      if (data.errors) {
        const errorMessage = data.errors[0].extensions.originalError.message;
        openNotificationWithIcon(
          'error',
          'Update profile error',
          errorMessage + '!'
        );
        throw new Error(errorMessage);
      }
      if (data) {
        form.resetFields();
        form.setFieldValue('Username', data.data.updateUser.username);
        const newUserSession = {
          token: userSession.token,
          user: {
            email: userSession.user.email,
            username: data.data.updateUser.username,
            rol: userSession.user.rol,
          },
        };
        setUser(newUserSession);
        openNotificationWithIcon(
          'success',
          'Update profile successful',
          'Your profile has been updated successfully!'
        );
      }
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
        <div className={styles.profile}>
          <h1>Update your profile</h1>
          <div></div>
          <Form
            form={form}
            className="profile-form"
            size="large"
            layout="vertical"
            initialValues={{ remember: true }}
            validateMessages={validateMessages}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
          >
            <Form.Item
              name="Username"
              label="Change your username"
              rules={[{required: true, type: 'string', min: 3, max: 20 }]}
            >
              <Input
                defaultValue={userSession.user.username}
                placeholder="Enter your new username"
                prefix={<UserOutlined className="site-form-item-icon" />}
              />
            </Form.Item>

            <Form.Item
              name="Password"
              label="Change your password"
              rules={[{ type: 'string', min: 8 }]}
            >
              <Input.Password
                placeholder="Enter your new password"
                prefix={<LockOutlined className="site-form-item-icon" />}
              />
            </Form.Item>

            <Form.Item className={styles.fixWidth}>
              <Button
                type="primary"
                htmlType="submit"
                className="login-form-button"
              >
                Update
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Spin>
    </>
  );
};

export default Profile;

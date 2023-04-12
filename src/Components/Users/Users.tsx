import { useEffect, useState } from 'react';
import styles from './Tickets.module.css';
import UserCard from './UserCard';
import {
  Button,
  Collapse,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Spin,
  Switch,
  Upload,
  message,
} from 'antd';
import {
  LoadingOutlined,
  SearchOutlined,
  PlusOutlined,
  FieldNumberOutlined,
  FileTextOutlined,
  MailOutlined,
} from '@ant-design/icons';
import type { RcFile, UploadFile } from 'antd/es/upload/interface';

const Users = ({ user }: any) => {
  return (
    <>
      <h1>Users admin panel</h1>;
      <p>Not implemented yet</p>
    </>
  );
};

export default Users;

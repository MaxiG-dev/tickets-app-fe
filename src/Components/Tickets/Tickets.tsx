import { useEffect, useState } from 'react';
import styles from './Tickets.module.css';
import TicketCard from './TicketCard';
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

const Tickets = ({ user }: any) => {
  const { Panel } = Collapse;
  const { TextArea } = Input;
  const { Option } = Select;
  const [tickets, setTickets] = useState([]);
  const [ticketDefault, setTicketDefault] = useState(['']);
  const [ticketFilter, setTicketFilter] = useState<any>(null);
  const [emptyMessage, setEmptyMessage] = useState('Fetching tickets...');
  const [loading, setLoading] = useState(false);
  const [fileListImg, setFileListImg] = useState<UploadFile[]>([]);
  const [fileListCsv, setFileListCsv] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [ticketModalConfirmLoading, setTicketModalConfirmLoading] =
    useState(false);
  const [searchModalConfirmLoading, setSearchModalConfirmLoading] =
    useState(false);
  const [ticketModalContent, setTicketModalContent] = useState('');
  const [searchModalContent, setSearchModalContent] = useState('');
  const [openTicketModal, setOpenTicketModal] = useState(false);
  const [openSearchModal, setOpenSearchModal] = useState(false);
  const [ticketForm] = Form.useForm();
  const [searchForm] = Form.useForm();

  const validateMessages = {
    required: '${label} is required!',
    types: {
      email: '${label} format invalid!',
      password: '${label} is not validate password!',
      number: '${label} is not a validate number!',
    },
    string: {
      min: '${label} must be at least ${min} characters',
    },
    number: {
      range: '${label} must be between ${min} and ${max}',
      min: '${label} cannot be less than ${min}',
    },
  };

  useEffect(() => {
    getTickets();
  }, [user]);

  const getTickets = async (fieldForms?: any) => {
    const graphql = JSON.stringify({
      query: `query Tickets($filterInput: FilterInput, $pagination: Pagination) {
          tickets(filterInput: $filterInput, pagination: $pagination) {
            username
            email
            tickets {
              purchaseNumber,
              title,
              status,
              purchaseDetail,
              problem,
              description,
              createdAt,
              updatedAt,
              imageName,
              isDeleted
          }
        }
      }`,
      variables: {
        filterInput: fieldForms
          ? fieldForms
          : {
              status: null,
              purchaseNumber: null,
              filterParam: null,
              email: null,
              includeDeleted: null,
            },
        pagination: { limit: null, page: null },
      },
    });
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + user.token,
        },
        body: graphql,
      });
      const data = await response.json();
      if (data.errors) {
        setEmptyMessage('No tickets found');
        message.warning(data.errors[0].message + '!');
        throw new Error(data.errors[0].message);
      }
      if (data) {
        setTicketDefault(data.data.tickets[0].email);
        setTickets(data.data.tickets);
      }
      return data.data.tickets;
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const showTicketModal = (content: any) => {
    setTicketModalContent(content);
    setOpenTicketModal(true);
  };

  const showSearchModal = (content: any) => {
    setSearchModalContent(content);
    setOpenSearchModal(true);
  };

  const handleCancelTicketModal = () => {
    setOpenTicketModal(false);
  };

  const handleCancelSearchModal = () => {
    setOpenSearchModal(false);
  };

  const handleOkTicketModal = async () => {
    const validForm = await ticketForm
      .validateFields()
      .then(() => true)
      .catch(() => false);
    if (validForm) {
      setTicketModalConfirmLoading(true);
      const formData = new FormData();
      formData.append('csv', fileListCsv[0] as RcFile);
      formData.append('image', fileListImg[0] as RcFile);
      formData.append(
        'purchaseNumber',
        ticketForm.getFieldsValue()['Purchase number']
      );
      formData.append('title', ticketForm.getFieldsValue()['Title']);
      formData.append('problem', ticketForm.getFieldsValue()['Problem']);
      formData.append(
        'description',
        ticketForm.getFieldsValue()['Description']
      );
      setUploading(true);
      try {
        const response = await fetch(
          `http://localhost:3000/api/ticket/create`,
          {
            method: 'POST',
            headers: {
              Authorization: 'Bearer ' + user.token,
            },
            body: formData,
          }
        );
        const data = await response.json();
        if (data.error) {
          throw new Error(data.message);
        }
        if (data) {
          setFileListImg([]);
          setFileListCsv([]);
          ticketForm.resetFields();
          message.success('Ticket created successfully.');
          getTickets();
        }
      } catch (error: any) {
        message.error(error + '!');
      } finally {
        setUploading(false);
        setOpenTicketModal(false);
        setTicketModalConfirmLoading(false);
      }
    }
  };

  const handleOkSearchModal = async () => {
    const validForm = await searchForm
      .validateFields()
      .then(() => true)
      .catch(() => false);
    if (validForm) {

      const fieldForms = {
        nro: searchForm.getFieldsValue()['Purchase number'],
        email: searchForm.getFieldsValue()['Email'],
        keyword: searchForm.getFieldsValue()['Filter keywords'],
        status: searchForm.getFieldsValue()['Status'],
        deleted: searchForm.getFieldsValue()['Is deleted'],
      };

      const checkFilter = {
        purchaseNumber: fieldForms.nro && fieldForms.nro !== '' ? fieldForms.nro : null,
        email: fieldForms.email && fieldForms.email !== '' ? fieldForms.email : null,
        filterParam: fieldForms.keyword && fieldForms.keyword !== '' ? fieldForms.keyword : null,
        status: fieldForms.status && fieldForms.status !== '' ? fieldForms.status : null,
        includeDeleted: fieldForms.deleted && fieldForms.deleted !== '' ? fieldForms.deleted : null,
      }

      setOpenSearchModal(false);
      await getTickets(checkFilter);
    } else {
      message.warning('Please fill some field to search!');
    }
  };

  return (
    <>
      <Spin
        indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
        spinning={loading}
      >
        <div className={styles.dashboard}>
          <h2 className={styles.title}>
            {user.user.rol.includes('admin')
              ? 'Admin tickets dashboard'
              : 'Tickets dashboard'}
          </h2>
          <span>
            {!user.user.rol.includes('admin') && (
              <Button
                type="primary"
                onClick={() =>
                  showTicketModal(
                    <>
                      <Form
                        form={ticketForm}
                        labelCol={{ span: 14 }}
                        wrapperCol={{ span: 50 }}
                        layout="vertical"
                        validateMessages={validateMessages}
                      >
                        <Form.Item
                          name="Purchase number"
                          rules={[{ required: true, type: 'number', min: 1 }]}
                        >
                          <InputNumber
                            prefix={
                              <FieldNumberOutlined className="site-form-item-icon" />
                            }
                            placeholder="Enter purchase number"
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                        <Form.Item
                          name="Title"
                          rules={[{ required: true, type: 'string', min: 3 }]}
                        >
                          <Input
                            prefix={
                              <FileTextOutlined className="site-form-item-icon" />
                            }
                            placeholder="Ticket title"
                          />
                        </Form.Item>
                        <Form.Item
                          name="Problem"
                          rules={[{ required: true, type: 'string', min: 3 }]}
                        >
                          <Input
                            prefix={
                              <FileTextOutlined className="site-form-item-icon" />
                            }
                            placeholder="Ticket Problem"
                          />
                        </Form.Item>
                        <Form.Item
                          label="Description"
                          name="Description"
                          rules={[{ required: true, type: 'string', min: 3 }]}
                        >
                          <TextArea rows={4} />
                        </Form.Item>
                        <span className={styles.uploadContainer}>
                          <Form.Item name="image" valuePropName="fileListImg">
                            <Upload
                              maxCount={1}
                              listType="picture-card"
                              onPreview={() => {
                                message.error('Awaiting image upload');
                              }}
                              onRemove={() => {
                                setFileListImg([]);
                              }}
                              beforeUpload={(file, fileList) => {
                                const isIMG =
                                  file.type === 'image/png' ||
                                  file.type === 'image/jpg' ||
                                  file.type === 'image/jpeg';
                                if (!isIMG) {
                                  fileList.pop();
                                  message.error(
                                    `${file.name} is not a valid image`
                                  );
                                }
                                isIMG
                                  ? setFileListImg([file])
                                  : setFileListImg([]);
                                return false;
                              }}
                            >
                              <div>
                                <PlusOutlined />
                                <div style={{ marginTop: 8 }}>
                                  Drop image to upload
                                </div>
                              </div>
                            </Upload>
                          </Form.Item>
                          <Form.Item name="csv" valuePropName="fileListCsv">
                            <Upload
                              maxCount={1}
                              listType="picture-card"
                              onRemove={() => {
                                setFileListCsv([]);
                              }}
                              beforeUpload={(file, fileList) => {
                                const isCSV = file.type === 'text/csv';
                                if (!isCSV) {
                                  fileList.pop();
                                  message.error(
                                    `${file.name} is not a valid csv`
                                  );
                                }
                                isCSV
                                  ? setFileListCsv([file])
                                  : setFileListCsv([]);
                                return false;
                              }}
                            >
                              <div>
                                <PlusOutlined />
                                <div style={{ marginTop: 8 }}>
                                  Drop csv to upload
                                </div>
                              </div>
                            </Upload>
                          </Form.Item>
                        </span>
                      </Form>
                    </>
                  )
                }
              >
                Create new ticket
              </Button>
            )}
            <Button
              icon={<SearchOutlined />}
              onClick={() =>
                showSearchModal(
                  <>
                    <Form
                      form={searchForm}
                      labelCol={{ span: 14 }}
                      wrapperCol={{ span: 50 }}
                      layout="vertical"
                      validateMessages={validateMessages}
                    >
                      <Form.Item
                        name="Purchase number"
                        rules={[{ type: 'number', min: 1 }]}
                      >
                        <InputNumber
                          prefix={
                            <FieldNumberOutlined className="site-form-item-icon" />
                          }
                          placeholder="Filter by purchase number"
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                      {user.user.rol.includes('admin') && (
                        <Form.Item
                          name="Email"
                          rules={[{ type: 'string', min: 3 }]}
                        >
                          <Input
                            prefix={
                              <MailOutlined className="site-form-item-icon" />
                            }
                            placeholder="Filter by user email"
                          />
                        </Form.Item>
                      )}
                      <Form.Item
                        name="Filter keywords"
                        rules={[{ type: 'string', min: 3 }]}
                      >
                        <Input
                          prefix={
                            <SearchOutlined className="site-form-item-icon" />
                          }
                          placeholder="Filter by keywords"
                        />
                      </Form.Item>
                      <Form.Item name="Status">
                        <Select placeholder="Filter by status" allowClear>
                          <Option value="open">Open</Option>
                          <Option value="closed">Closed</Option>
                          <Option value="resolved">Resolved</Option>
                          <Option value="awaiting vendor response">
                            Awaiting vendor response
                          </Option>
                          <Option value="awaiting customer response">
                            Awaiting customer response
                          </Option>
                        </Select>
                      </Form.Item>
                      {user.user.rol.includes('admin') && (
                        <Form.Item
                          label="Include deleted tickets"
                          name="Is deleted"
                          valuePropName="checked"
                        >
                          <Switch />
                        </Form.Item>
                      )}
                    </Form>
                  </>
                )
              }
            >
              Search
            </Button>
          </span>
        </div>
        {tickets.length ? (
          <>
            <Collapse
              className={styles.accordion}
              accordion
              size="large"
              defaultActiveKey={
                !user.user.rol.includes('admin') ? ticketDefault : ''
              }
            >
              {tickets.map((ticketUser: any) => {
                return (
                  <Panel
                    header={
                      ticketUser.username +
                      ' - ' +
                      ticketUser.tickets.length +
                      ' tickets found.'
                    }
                    key={ticketUser.email}
                  >
                    <div className={styles.tickets}>
                      {ticketUser.tickets.map((ticket: any) => {
                        return (
                          <TicketCard
                            key={ticket.purchaseNumber}
                            ticket={ticket}
                            userEmail={ticketUser.email}
                            user={user}
                            getTickets={getTickets}
                          />
                        );
                      })}
                    </div>
                  </Panel>
                );
              })}
            </Collapse>
          </>
        ) : (
          <Empty
            description={emptyMessage}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            className={styles.empty}
          />
        )}
        <Modal
          title="Create a new ticket"
          open={openTicketModal}
          onOk={handleOkTicketModal}
          confirmLoading={ticketModalConfirmLoading}
          onCancel={handleCancelTicketModal}
        >
          {ticketModalContent}
        </Modal>
        <Modal
          title="Search tickets"
          open={openSearchModal}
          onOk={handleOkSearchModal}
          confirmLoading={searchModalConfirmLoading}
          onCancel={handleCancelSearchModal}
        >
          {searchModalContent}
        </Modal>
      </Spin>
    </>
  );
};

export default Tickets;

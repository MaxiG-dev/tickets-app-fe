import {
  Button,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Tooltip,
  Upload,
  message,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  FileImageOutlined,
  FileExcelOutlined,
  UndoOutlined,
  FieldNumberOutlined,
  PlusOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import styles from './Tickets.module.css';
import { useState } from 'react';
import type { RcFile, UploadFile } from 'antd/es/upload/interface';
import TextArea from 'antd/es/input/TextArea';

const TicketCard = ({ ticket, userEmail, user, getTickets }: any) => {

  console.log(userEmail)
  const [modalContent, setModalContent] = useState('');
  const [open, setOpen] = useState(false);
  const [fileListImg, setFileListImg] = useState<UploadFile[]>([]);
  const [fileListCsv, setFileListCsv] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [ticketModalContent, setTicketModalContent] = useState('');
  const [openTicketModal, setOpenTicketModal] = useState(false);
  const [ticketModalConfirmLoading, setTicketModalConfirmLoading] =
    useState(false);

  const [ticketForm] = Form.useForm();

  const {
    purchaseNumber,
    title,
    status,
    purchaseDetail,
    problem,
    description,
    createdAt,
    updatedAt,
    imageName,
    isDeleted,
  } = ticket;

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

  const parseCreatedDate = new Date(+createdAt).toLocaleDateString();
  const parseUpdatedDate = updatedAt
    ? `Last update: ${new Date(+updatedAt).toLocaleDateString()}`
    : 'Not updated yet';

  const showModal = (content: any) => {
    setModalContent(content);
    setOpen(true);
    console.log('test');
  };

  const toogleTicket = async () => {
    const graphql = JSON.stringify({
      query: `mutation DeleteTicket {
          deleteTicket(deleteInput: {
            purchaseNumber: ${+purchaseNumber},
            deleteAction: ${isDeleted ? false : true},
            email: "${userEmail}",
            }) {
              isDeleted
              purchaseNumber
            }
      }`,
    });
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
        message.error(data.errors[0].message + '!');
        throw new Error(data.errors[0].message);
      }

      if (data) {
        message.success(isDeleted ? 'Ticket restored!' : 'Ticket deleted!');
        getTickets();
      }
    } catch (error) {}
  };

  const showTicketModal = (content: any) => {
    setTicketModalContent(content);
    ticketForm.setFieldsValue({
      'Purchase number': purchaseNumber,
      Title: title,
      Problem: problem,
      Description: description,
    });
    setOpenTicketModal(true);
  };

  const handleCancelTicketModal = () => {
    setOpenTicketModal(false);
  };

  const handleOkTicketModal = async () => {
    const validForm = await ticketForm
      .validateFields()
      .then(() => true)
      .catch(() => false);
    if (validForm) {
      setTicketModalConfirmLoading(true);
      const formData = new FormData();
      formData.append('email', userEmail);
      formData.append('csv', fileListCsv[0] as RcFile);
      formData.append('image', fileListImg[0] as RcFile);
      formData.append('purchaseNumber', purchaseNumber);
      formData.append('title', ticketForm.getFieldsValue()['Title']);
      formData.append('problem', ticketForm.getFieldsValue()['Problem']);
      formData.append(
        'description',
        ticketForm.getFieldsValue()['Description']
      );
      setUploading(true);
      try {
        console.log(formData)
        const response = await fetch(
          `http://localhost:3000/api/ticket/update`,
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
          message.success('Ticket updated successfully.');
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

  return (
    <>
      <div
        className={styles.ticketCard}
        style={isDeleted ? { opacity: 0.4 } : {}}
      >
        <div className={styles.ticketCardHeader}>
          <h2>{title}</h2>
          <Tooltip title="Current ticket status">
            <p className={status.replaceAll(' ', '')}>{status}</p>
          </Tooltip>
        </div>
        <div className={styles.ticketCardBody}>
          <p>{problem}</p>
          <p>{description}</p>
          <div className={styles.ticketDate}>
            <p>Created at: {parseCreatedDate}</p>
            <p>{parseUpdatedDate}</p>
          </div>
        </div>
        <div className={styles.ticketCardFooter}>
          <Tooltip title="This is the purchase number">
            <p>#{purchaseNumber}</p>
          </Tooltip>
          <span>
            {imageName && (
              <Tooltip title="Preview images">
                <Button
                  type="primary"
                  shape="circle"
                  icon={<FileImageOutlined />}
                  onClick={() =>
                    showModal(<Image width={240} src={imageName} />)
                  }
                />
              </Tooltip>
            )}
            {purchaseDetail && (
              <Tooltip title="Download csv">
                <a href={purchaseDetail} download>
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<FileExcelOutlined />}
                  />
                </a>
              </Tooltip>
            )}
            <Tooltip title="Edit ticket">
              <Button
                shape="circle"
                icon={<EditOutlined />}
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
              />
            </Tooltip>
            {isDeleted ? (
              <Tooltip title="Restore ticket">
                <Popconfirm
                  title="Restore ticket"
                  description={<p>Restore the ticket?</p>}
                  onConfirm={toogleTicket}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button type="primary" shape="circle" icon={<UndoOutlined />} />
                </Popconfirm>
              </Tooltip>
            ) : (
              <Tooltip title="Delete ticket">
                <Popconfirm
                  title="Delete the ticket"
                  description={
                    <>
                      <p>Are you sure to delete this ticket?</p>{' '}
                      <p> Only the support can restore it.</p>
                    </>
                  }
                  onConfirm={toogleTicket}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button shape="circle" icon={<DeleteOutlined />} />
                </Popconfirm>
              </Tooltip>
            )}
          </span>
        </div>
      </div>
      <Modal
        title={'Edit ticket #' + purchaseNumber}
        open={openTicketModal}
        onOk={handleOkTicketModal}
        confirmLoading={ticketModalConfirmLoading}
        onCancel={handleCancelTicketModal}
      >
        {ticketModalContent}
      </Modal>
      <Modal
        className={styles.flexModal}
        onCancel={() => setOpen(false)}
        title={'Images of ticket #' + purchaseNumber}
        open={open}
        footer={[]}
      >
        {modalContent}
      </Modal>
    </>
  );
};

export default TicketCard;

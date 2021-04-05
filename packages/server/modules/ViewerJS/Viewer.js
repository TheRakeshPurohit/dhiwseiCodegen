import React, { useEffect } from "react";
import { useViewer } from "./hooks/useViewer";
import { Modal, Button, Form, Input, Checkbox, Select } from "antd";

const { Option } = Select;

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 }
};

const Viewer = () => {
  const [viewerData, setViewerData] = useViewer();

  useEffect(() => {
    if (viewerData) {
      console.log("viewerData: ", viewerData);
    }
  }, [viewerData]);

  const handleOk = () => {
    setViewerData({
      ...viewerData,
      showSidebar: false
    });
  };

  const handleCancel = () => {
    setViewerData({
      ...viewerData,
      showSidebar: false
    });
  };

  function handleChange(value) {
    console.log(`selected ${value}`);
  }

  return (
    <div>
      <Modal
        title="Add API Call"
        visible={viewerData.showSidebar || false}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form {...layout} name="basic" initialValues={{ remember: true }}>
          <Form.Item label="API URL" name="api_url">
            <Input />
          </Form.Item>
          <Form.Item label="Inputs">
            <Select style={{ width: 120 }} onChange={handleChange}>
              {viewerData.inputFibers &&
                Array.isArray(viewerData.inputFibers) &&
                viewerData.inputFibers.length > 0 &&
                viewerData.inputFibers.map((input) => (
                  <Option value={input.name}>{input.name}</Option>
                ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Viewer;

import React, { useEffect } from "react";
import { useViewer } from "./hooks/useViewer";
import { Modal, Button, Form, Input, Checkbox, Select } from "antd";

const { Option } = Select;

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 }
};

const FORMAPI = "http://localhost:5000/astParser/addApiToForm";


const Viewer = () => {
  const [viewerData, setViewerData] = useViewer();

  useEffect(() => {
    if (viewerData) {
      console.log("viewerData: ", viewerData);
    }
  }, [viewerData]);

  function validateData(data) {
    if (!data.container || data.container === "") {
      return false;
    }

    if (
      !data.inputs ||
      !Array.isArray(data.inputs) ||
      data.inputs.length === 0
    ) {
      return false;
    }

    if (!data.apiUrl || !data.apiUrl === "") {
      return false;
    }

    return true;
  }



  const handleOk = () => {
    if (validateData(viewerData)) {
      let postData = {
        container: {
          name: "RegisterForm",
          src: viewerData.container
        },
        inputs: viewerData.inputs.map((input) => ({
          name: input,
          src: null
        })),
        apiUrl: viewerData.apiUrl
      };
      console.log("postData: ", postData);

      window
        .fetch(FORMAPI, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(postData)
        })
        .then(async (res) => await res.json())
        .then((data) => console.log("data: ", data))
        .catch((err) => console.error(err));

      setViewerData({
        ...viewerData,
        showSidebar: false
      });
    } else {
      console.log("invalid data");
    }
  };

  const handleCancel = () => {
    setViewerData({
      ...viewerData,
      showSidebar: false
    });
  };

  function handleChange(value) {
    setViewerData({
      ...viewerData,
      inputs: [value]
    });
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
            <Input 
              onChange={(e) =>
                setViewerData({
                  ...viewerData,
                  apiUrl: e.target.value
                })
              }
            />
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

import React, { PureComponent } from 'react';
import { Upload, Icon, message } from 'antd';
import oss from 'ali-oss';

const client = self => {
  return new oss({
      accessKeyId: 'your access_key_id',
      accessKeySecret: 'your access_key_secret',
      stsToken: 'your security_token',
      endpoint: 'http://oss-cn-hangzhou.aliyuncs.com',
      bucket: 'your bucket',
  });
};

const UploadToOss = (self, path, file) => {
  const url = 'your upload path';
  return new Promise((resolve, reject) => {
      client(self)
      .multipartUpload(url, file)  // 此处调用ali-oss的multipartUpload方法
      .then(data => {
          resolve(data);
      })
      .catch(error => {
          reject(error);
      });
  });
};

export default class UploadOss extends PureComponent {
  state = {
    imageUrl: '',
  }

  handleGetImage = async (name) => {
    // 从oss获取图片
    const store = oss({
        accessKeyId: 'your access_key_id',
        accessKeySecret: 'your access_key_secret',
        stsToken: 'your security_token',
        region: 'your region',
        bucket: 'your bucket',
    });
    // 此处调用ali-oss的signatureUrl获取文件对应访问路径
    const imageUrl = store.signatureUrl(name);
    this.setState({
        imageUrl,
    });
}

  beforeUpload = file => {
    const typeName = (file && file.type.substring(0, file.type.indexOf('/'))) || '';
    const isIMAGE = typeName === 'image';
    if (!isIMAGE) {
        message.error('请上传图片文件!');
        return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
        message.error('文件大小小于2MB!');
        return false;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
        // 使用ossupload覆盖默认的上传方法
        UploadToOss(this, 'your upload path', file).then(data => {
          const name = data && data.name || '';
          this.handleGetImage(name);
        });
    };
    return false; // 不调用默认的上传方法
};

  render() {
    const { imageUrl } = this.state;
    const uploadButton = (
      <div>
        <Icon type='plus' />
        <div className="ant-upload-text">上传</div>
      </div>
    );
    return (
      <Upload
        name="avatar"
        listType="picture-card"
        showUploadList={false}
        beforeUpload={this.beforeUpload}
      >
        {imageUrl ? null : uploadButton}
      </Upload>
    );
  }
}

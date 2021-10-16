/*
   Copyright (c) 2018, Autonomous Networks Research Group. All rights reserved.
   Read license file in main directory for more details
*/

import { Button, Form, Input, Select } from "antd";
import React, { Component } from "react";
import ipfs from "./ipfs";
import storehash from "./storehash";
import web3 from "./web3";

const Option = Select.Option;
const FormItem = Form.Item;

class RegistrationForm extends Component {
  state = {
    // display
    description: "",
    price: "",
    longitude: "",
    latitude: "",
    seller_credential: "",
    ip_address: "",
    public_address: "",
    data_unit: "",
    seller: "",
    peripheral_sensor: "",

    // ipfs part
    ipfsHash: null,
    buffer: "",
    ethAddress: "",
    blockNumber: "",
    transactionHash: "",
    gasUsed: "",
    txReceipt: "",
  };

  getHexfromIPFSHash = (ipfsHash) => {
    let hash = Buffer.from(ipfsHash).toString("hex");
    return {
      hash_start: `0x${hash.substring(0, 64)}`,
      hash_end: `0x${hash.slice(64)}`,
      protocol_type: "0x01",
    };
  };

  handleBtnClick = (e) => {
    this.sendToIpfs();
    if (this.state.ipfsHash !== "") {
      alert("Register Success!");
    }
  };

  sendToIpfs = () => {
    this.convertToBuffer();
    this.onSubmit();
  };

  convertToBuffer = async () => {
    // file is converted to a buffer for upload to IPFS
    const obj = {
      Seller: this.state.seller,
      Peripheral_Sensor: this.state.peripheral_sensor,
      Product_Description: this.state.description,
      Longitude: this.state.longitude,
      Latitude: this.state.latitude,
      Price_per_Data_Unit_USD: this.state.price,
      Data_Unit: this.state.data_unit,
      IP_Address: this.state.ip_address,
      Public_Address: this.state.public_address,
      Seller_Credentials: this.state.seller_credential,
    };

    const buffer = await Buffer.from(JSON.stringify(obj));
    this.setState({ buffer });
  };

  onSubmit = async () => {
    // bring in user's metamask account address
    const account = web3.eth.accounts.privateKeyToAccount(
      "0xC89ADA337DCDD9D9D092D582104064554DDC3A835B0D164B82E304F0DFC5F0FC"
    );
    web3.eth.accounts.wallet.add(account);
    web3.eth.defaultAccount = account.address;

    // obtain contract address from storehash.js
    const ethAddress = await storehash.options.address;
    this.setState({ ethAddress });
    // save document to IPFS,return its hash#, and set hash# to state
    // https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#add
    await ipfs.add(this.state.buffer, (err, ipfsHash) => {
      console.log(err, ipfsHash);
      this.setState({ ipfsHash: ipfsHash[0].hash });
      // call Ethereum contract method "sendHash" and .send IPFS hash to etheruem contract
      // return the transaction hash from the ethereum contract
      // see, this https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#methods-mymethod-send

      let data = this.getHexfromIPFSHash(this.state.ipfsHash);
      console.log(data);
      storehash.methods
        .postProduct(data.hash_start, data.hash_end, data.protocol_type)
        .send(
          {
            from: account.address,
            gas: 1000000,
          },
          (error, transactionHash) => {
            console.log(transactionHash);
            this.setState({ transactionHash });
          }
        );
    });
  };

  handleInputChange = (input, e) => {
    debugger;
    const value = e.target.value;
    this.setState({
      [input]: value,
    });
  };

  render() {
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 12 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
      },
    };
    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0,
        },
        sm: {
          span: 16,
          offset: 8,
        },
      },
    };

    const description = "description";
    const price = "price";
    const longitude = "longitude";
    const latitude = "latitude";
    const ip_address = "ip_address";
    const public_address = "public_address";
    const seller = "seller";
    const peripheral_sensor = "peripheral_sensor";

    return (
      <Form className="register-form">
        <div className="left-form">
          <FormItem label="Type" {...formItemLayout}>
            <Select defaultValue="SDPP" style={{ width: 150 }}>
              <Option value="others">OTHER</Option>
              <Option value="SDPP">SDPP</Option>
            </Select>
          </FormItem>
          <FormItem label="Seller" {...formItemLayout}>
            <Input
              value={this.state.seller}
              onChange={(e) => this.handleInputChange(seller, e)}
            />
          </FormItem>

          <FormItem label="Peripheral Sensor" {...formItemLayout}>
            <Input
              value={this.state.peripheral_sensor}
              onChange={(e) => this.handleInputChange(peripheral_sensor, e)}
            />
          </FormItem>
          <FormItem label="Description" {...formItemLayout}>
            <Input
              value={this.state.description}
              onChange={(e) => this.handleInputChange(description, e)}
            />
          </FormItem>
          <FormItem label="Longitude" {...formItemLayout}>
            <Input
              value={this.state.longitude}
              onChange={(e) => this.handleInputChange(longitude, e)}
            />
          </FormItem>
        </div>
        <div className="right-form">
          <FormItem label="Latitude" {...formItemLayout}>
            <Input
              value={this.state.latitude}
              onChange={(e) => this.handleInputChange(latitude, e)}
            />
          </FormItem>

          <FormItem label="Price in USD" {...formItemLayout}>
            <Input
              value={this.state.price}
              onChange={(e) => this.handleInputChange(price, e)}
            />
          </FormItem>
          <FormItem label="IP Address" {...formItemLayout}>
            <Input
              value={this.state.ip_address}
              onChange={(e) => this.handleInputChange(ip_address, e)}
            />
          </FormItem>

          <FormItem label="Public Address" {...formItemLayout}>
            <Input
              value={this.state.public_address}
              onChange={(e) => this.handleInputChange(public_address, e)}
            />
          </FormItem>
        </div>

        <div>
          <FormItem {...tailFormItemLayout}>
            <Button
              className="regbutton"
              type="primary"
              htmlType="submit"
              onClick={this.handleBtnClick}
            >
              Register
            </Button>
          </FormItem>
        </div>
      </Form>
    );
  }
}

export const NewRegistrationForm = Form.create()(RegistrationForm);

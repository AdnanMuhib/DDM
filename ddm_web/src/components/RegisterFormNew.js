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
const { TextArea } = Input;

class RegistrationForm extends Component {
  state = {
    // display
    seller_name: "",
    description: "",
    price: "",
    public_address: "",
    dataset_name: "",
    seller_credentials: "",

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
      console.log("Dataset Registered to IPFS Successfully!");
      // alert("Dataset Registered Successfully!");
    }
  };

  sendToIpfs = () => {
    this.convertToBuffer();
    this.onSubmit();
  };

  convertToBuffer = async () => {
    // file is converted to a buffer for upload to IPFS
    const obj = {
      seller_name: this.state.seller_name,
      dataset_name: this.state.dataset_name,
      product_description: this.state.description,
      price_per_unit_usd: this.state.price,
      public_address: this.state.public_address,
      seller_credentials: this.state.seller_credentials,
    };
    const buffer = await Buffer.from(JSON.stringify(obj));
    this.setState({ buffer });
  };

  onSubmit = async () => {
    // bring in user's metamask account address
    // const account = web3.eth.accounts.privateKeyToAccount(
    //   "0xC89ADA337DCDD9D9D092D582104064554DDC3A835B0D164B82E304F0DFC5F0FC"
    // );
    // const account = web3.eth.accounts.privateKeyToAccount(
    //   "691e92fb03628b6cd1c6a40e4a75ccfceaa62777fd73135f503172ce10789304"
    // );
    const account = web3.eth.accounts.privateKeyToAccount(
      "0xDAe0cba5097939CeAB4C0dfb608caA66F8980a87"
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
            gasPrice: 10000000000,
            gas: 1000000,
          },
          (error, transactionHash) => {
            console.error(error);
            console.log(transactionHash);
            this.setState({ transactionHash });
          }
        );
    });
  };

  handleInputChange = (input, e) => {
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
    const public_address = "public_address";
    const seller_name = "seller_name";
    const dataset_name = "dataset_name";

    return (
      <Form className="register-form">
        <div className="left-form">
          <FormItem label="Dataset Name" {...formItemLayout}>
            <Input
              value={this.state.dataset_name}
              onChange={(e) => this.handleInputChange(dataset_name, e)}
            />
          </FormItem>
          <FormItem label="Dataset Address" {...formItemLayout}>
            <Input
              value={this.state.public_address}
              onChange={(e) => this.handleInputChange(public_address, e)}
            />
          </FormItem>
          <FormItem label="Description" {...formItemLayout}>
            <TextArea
              value={this.state.description}
              onChange={(e) => this.handleInputChange(description, e)}
            />
          </FormItem>
        </div>
        <div className="right-form">
          <FormItem label="Type" {...formItemLayout}>
            <Select defaultValue="SDPP" style={{ width: 150 }}>
              <Option value="others">OTHER</Option>
              <Option value="SDPP">SDPP</Option>
            </Select>
          </FormItem>
          <FormItem label="Price in USD" {...formItemLayout}>
            <Input
              value={this.state.price}
              onChange={(e) => this.handleInputChange(price, e)}
            />
          </FormItem>
          <FormItem label="Seller Name:" {...formItemLayout}>
            <Input
              value={this.state.seller_name}
              onChange={(e) => this.handleInputChange(seller_name, e)}
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

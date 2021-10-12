# Copyright (c) 2018, Autonomous Networks Research Group. All rights reserved.
#     Read license file in main directory for more details

#!/usr/bin/env python

import asyncio
import io
import json
import os

# import iota
import pandas as pd
import websockets
import sys


# Connect to the tangle
seed = ""
client = "http://node02.iotatoken.nl:14265"

# iota_api = iota.Iota(client, seed

MSG_GET_DATA = 'get_data'
MSG_GET_META_DATA = 'get_meta_data'
MSG_GET_DATA_SAMPLE = 'get_sample'
MSG_GET_SUMMARY = 'get_summary'
DATA_SAMPLE_ROWS = 10

# TODO receive it from the buyer
#  payment_address = iota.Address('RFQASBVGDTTPDEYVSPIWHG9YUMHAGHFDUZVVXEMDRNNMWJHQYBWHXWQ9JST9NZFBFMFPPFETFLE9RMUJCTNXFZJDGW')

dataset_file_path = ""  # will be assigned from the command line when server starts


def send_transaction(transaction):
    try:
        bundle = iota_api.send_transfer(depth=2, transfers=[transaction])
        url = "https://thetangle.org/bundle/" + str(bundle["bundle"].hash)
        print("Invoice - " + url)
    except iota.adapter.BadApiResponse as error:
        print(error)


def prepare_transaction(message=None, value=0):
    transaction = iota.ProposedTransaction(
        address=payment_address,
        value=value,

        # TODO: put the actual value
        message=iota.TryteString.from_string("Data Invoice"),
        tag=iota.Tag(b"SDPPBUYER")
    )

    return send_transaction(transaction)


def read_data_from_file(data):
    lines = []
    with open(dataset_file_path) as f:
        for i, line in enumerate(f):
            if i >= data['quantity']:
                break
            lines.append(line.strip())
    return lines


def get_data_sample():
    pass


def get_meta_data():
    pass


async def time(websocket, path):
    df = pd.read_csv(dataset_file_path, encoding='windows-1252')
    dataset = {}
    dataset['file_size_bytes'] = os.path.getsize(dataset_file_path)
    dataset['total_records'] = len(df.index)
    dataset['column_records'] = dict(df.count())
    dataset['columns'] = df.columns.values
    buffer = io.StringIO()
    df.info(buf=buffer)
    info_string = buffer.getvalue()
    info = info_string.replace("<class 'pandas.core.frame.DataFrame'>", '') \
        .split('\n')
    info = list(filter(None, info))
    dataset['summary'] = info[:-1]
    df = df.fillna('NULL_VALUE')
    dataset['sample_dataset'] = df.sample(
        n=DATA_SAMPLE_ROWS,
        random_state=1,
    )
    print("[INFO]: Connection Established with the Buyer...")
    while True:
        print("[INFO]: Waiting for the message from the Buyer... ")
        message = await websocket.recv()
        message = json.loads(message)
        message_type = message.get('message_type', None)
        if message_type is None:
            await websocket.send(json.dumps({'message': 'Unknown Request in message_type, allowed: get_data, get_sample, get_meta_data!'}))
            continue
        if message_type == MSG_GET_DATA_SAMPLE:
            print("[INFO]: Sending data sample to Buyer... ")
            response = dataset['sample_dataset'].to_json()
            await websocket.send(json.dumps(response))
            print("[INFO]: Data sample transfer complete... ")
        if message_type == MSG_GET_META_DATA:
            print("[INFO]: Sending meta data to Buyer... ")
            response = get_data_sample()
            await websocket.send(json.dumps(response))
            print("[INFO]: Meta data transfer complete... ")
        if message_type == MSG_GET_SUMMARY:
            print("[INFO]: Sending Summary of data to Buyer... ")
            await websocket.send(dataset['summary'])
            print("[INFO]: Data summary transfer complete... ")
        if message_type == MSG_GET_DATA:
            print("[INFO]: Sending data to Buyer... ")
            data = read_data_from_file(message)
            for d in data:
                await websocket.send(d)
            print("[INFO]: Data transfer complete... ")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(
            "Please use the command in the following format:  python seller_server.py {port_number} {dataset_path} ")
    else:
        port_number = int(sys.argv[1])
        dataset_file_path = sys.argv[2]

        print(f"[INFO]: Starting the Dataset Server on Port {port_number}...")
        print(f"[INFO]: Dataset Location is: {dataset_file_path}")

        start_server = websockets.serve(time, '127.0.0.1', port_number)

        asyncio.get_event_loop().run_until_complete(start_server)
        asyncio.get_event_loop().run_forever()
        print(
            f"[INFO]: Server waiting for connection on Port {port_number}...")

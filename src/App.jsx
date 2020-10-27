import './App.css';
import { useState, useEffect } from 'react';
import { Button } from '@material-ui/core';
import { ethers } from "ethers";

const TEST_STRING = 'TEST STRING';

const domain = {
  name: 'Ethers Tester',
  version: '1',
  chainId: 1,
  verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
};

// The named list of all type definitions
const types = {
  Person: [
    { name: 'name', type: 'string' },
    { name: 'wallet', type: 'address' }
  ],
  Mail: [
    { name: 'from', type: 'Person' },
    { name: 'to', type: 'Person' },
    { name: 'contents', type: 'string' }
  ]
};

// The data to sign
const value = {
  from: {
    name: 'Cow',
    wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826'
  },
  to: {
    name: 'Bob',
    wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB'
  },
  contents: TEST_STRING
};

async function connectEthers(setState) {
  await window.ethereum.enable()
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  setState({ provider, signer });
}

async function getAddress(setState) {
  const address = await window.ethereum.request({ method: 'eth_requestAccounts' });
  return setState(address);
}

async function signMessage(signer, setState) {
  try {
    const sig = await signer.signMessage(TEST_STRING);
    setState(sig);
  } catch(e) {
    alert('error')
  }
}

async function signTypedMessage(signer, setState) {
  const sig = await signer._signTypedData(domain, types, value);
  setState(sig);
}

async function signPersonal(provider, address, setState, asHex = false) {
  const hexString = ethers.utils.formatBytes32String(TEST_STRING);
  const toSign = asHex ? hexString : TEST_STRING
  const sig = await provider.send('personal_sign', [toSign, address]);
  setState(sig);
}

function App() {
  const [providers, setProviders] = useState({});
  const [address, setAddress] = useState('');
  const [signature, setSig] = useState('');
  const [typedSig, setTypedSig] = useState('');
  const [personalSig, setPersonalSig] = useState('');

  useEffect(() => {
    getAddress(setAddress)
  }, [providers])

  window.providers = providers
  return (
    <div className="App">
      <div>{address}</div>
      <Button color="primary" onClick={() => connectEthers(setProviders)}>Connect</Button>
      <div>{signature}</div>
      <Button color="primary" onClick={() => signMessage(providers.signer, setSig)}>Sign Message</Button>
      <div>{typedSig}</div>
      <Button color="primary" onClick={() => signTypedMessage(providers.signer, setTypedSig)}>Sign Typed Message</Button>
      <div>{personalSig}</div>
      <Button color="primary" onClick={() => signPersonal(providers.provider, address[0], setPersonalSig)}>Sign Personal Message</Button>
      <Button color="primary" onClick={() => signPersonal(providers.provider, address[0], setPersonalSig, true)}>Sign Personal Message as hex </Button>
    </div>
  );
}

export default App;

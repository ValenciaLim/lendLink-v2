const { expect } = require('chai');
const axios = require('axios');

describe('LendLink Integration Tests', function () {
  const BACKEND_URL = 'http://localhost:3002';
  const FRONTEND_URL = 'http://localhost:3000';

  describe('Backend API', function () {
    it('Should respond to health check', async function () {
      const response = await axios.get(`${BACKEND_URL}/health`);
      expect(response.status).to.equal(200);
      expect(response.data.status).to.equal('healthy');
    });

    it('Should return protocol overview', async function () {
      const response = await axios.get(`${BACKEND_URL}/api/v1/lending/overview`);
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.data).to.have.property('totalTVL');
      expect(response.data.data).to.have.property('totalDebt');
      expect(response.data.data).to.have.property('activeUsers');
    });

    it('Should return supported tokens', async function () {
      const response = await axios.get(`${BACKEND_URL}/api/v1/lending/supported-tokens`);
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.data).to.have.property('collateral');
      expect(response.data.data).to.have.property('borrow');
    });

    it('Should return analytics data', async function () {
      const response = await axios.get(`${BACKEND_URL}/api/v1/analytics/overview`);
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.data).to.have.property('protocolStats');
    });
  });

  describe('Frontend', function () {
    it('Should serve the React app', async function () {
      const response = await axios.get(FRONTEND_URL);
      expect(response.status).to.equal(200);
      expect(response.data).to.include('LendLink');
      expect(response.data).to.include('Decentralized LST Lending Protocol');
    });
  });

  describe('API Integration', function () {
    it('Should handle user position requests', async function () {
      const testAddress = '0x1234567890123456789012345678901234567890';
      const response = await axios.get(`${BACKEND_URL}/api/v1/lending/user/${testAddress}`);
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.data).to.have.property('address');
      expect(response.data.data).to.have.property('totalCollateralValue');
    });

    it('Should handle deposit requests', async function () {
      const depositData = {
        userAddress: '0x1234567890123456789012345678901234567890',
        token: 'stETH',
        amount: '10'
      };
      
      const response = await axios.post(`${BACKEND_URL}/api/v1/lending/deposit`, depositData);
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.message).to.equal('Deposit successful');
    });

    it('Should handle borrow requests', async function () {
      const borrowData = {
        userAddress: '0x1234567890123456789012345678901234567890',
        token: 'USDC',
        amount: '5000'
      };
      
      const response = await axios.post(`${BACKEND_URL}/api/v1/lending/borrow`, borrowData);
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.message).to.equal('Borrow successful');
    });
  });
}); 
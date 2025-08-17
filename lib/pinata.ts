import axios, { AxiosError } from 'axios';

const PINATA_API_URL = 'https://api.pinata.cloud';
const PINATA_GATEWAY = 'https://emerald-lazy-penguin-883.mypinata.cloud';

class PinataClient {
  private apiKey: string;
  private secretKey: string;
  private jwt: string;

  constructor() {
    this.apiKey = process.env.PINATA_API_KEY || '';
    this.secretKey = process.env.PINATA_SECRET_API_KEY || '';
    this.jwt = process.env.PINATA_JWT || '';
  }

  async uploadFile(file: File): Promise<{ cid: string; size: number }> {
    const formData = new FormData();
    formData.append('file', file);

    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        type: file.type,
        uploadedAt: new Date().toISOString(),
      }
    });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({
      cidVersion: 1,
    });
    formData.append('pinataOptions', options);

    try {
      const response = await axios.post(
        `${PINATA_API_URL}/pinning/pinFileToIPFS`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${this.jwt}`,
            'Content-Type': 'multipart/form-data',
          },
          maxBodyLength: Infinity,
        }
      );

      return {
        cid: response.data.IpfsHash,
        size: response.data.PinSize,
      };
    } catch (error) {
      console.error('Pinata upload error:', error);
      throw new Error('Failed to upload file to IPFS');
    }
  }

  getGatewayUrl(cid: string): string {
    return `${PINATA_GATEWAY}/ipfs/${cid}`;
  }

  async fetchFile(cid: string): Promise<ArrayBuffer> {
    try {
      const response = await axios.get(
        `${PINATA_GATEWAY}/ipfs/${cid}`,
        {
          headers: {
            'Authorization': `Bearer ${this.jwt}`,
          },
          responseType: 'arraybuffer',
          timeout: 30000, // 30 second timeout
        }
      );
      
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const status = error.response?.status || 'Network error';
        console.error('IPFS fetch error:', status);
        throw new Error(`Failed to fetch file from IPFS: ${status}`);
      } else {
        console.error('IPFS fetch error:', error);
        throw new Error('Failed to fetch file from IPFS: Unknown error');
      }
    }
  }
}

export const pinataClient = new PinataClient();
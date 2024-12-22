import { SERVER } from '@config/environment';
import axios from 'axios';


export class AxiosService {

  async getLibra(params: any) {
    console.log('get axios params',params);
    let { url, payload, auth } = params;
    const headersRequest = {
      "accept": "application/json",
      'authorization': `Bearer ${auth}`,
      'product': 'llu.android',
      "version": 4.7,
      "Cookie": "__cf_bm=2P_tOmFAV3H1ZXLU81CFLBUC4TFvb2zBghtLhpv36Tk-1729102836-1.0.1.1-IiqJcE2s3yOawe7x5IG.UtX0KHCtmk297w5kOEHLnDG7UR0qddJx25uCQPT5B8hM3RxqeV8QiXzObh4isE0jng"
    };
    try{
        const resp = await axios
          .get(`${url}`, {
            headers: headersRequest,
            params: payload,
            paramsSerializer: function paramsSerializer(params) {
              return Object.entries(params)
                .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
                .join('&');
            }
          });
        return resp.data;
    }
    catch(e){
      if(e.response?.data){
        console.log('e.response.data',e.response?.data)
        throw e.response.data;
      }
      else{
        throw e;
      }
    }
  }

  async getData(params: any) {
    console.log('get axios params',params);
    let { url, payload, auth } = params;
    const headersRequest = {
      'Content-Type': 'application/json',
      "accept": "application/json",
      'api_key': SERVER.API_KEY,
      'authorization': auth ? auth : "Basic bGlseTpsaWx5QDEyMw==" , // NOSONAR
      'platform':1,
      'accept-language':'en'
    };
    try{
        const resp = await axios
          .get(`${url}`, {
            headers: headersRequest,
            params: payload,
            paramsSerializer: function paramsSerializer(params) {
              return Object.entries(params)
                .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
                .join('&');
            }
          });
        return resp.data;
    }
    catch(e){
      if(e.response?.data){
        console.log('e.response.data',e.response?.data)
        throw e.response.data;
      }
      else{
        throw e;
      }
    }
  }

  async get(params: any) {
    let { url, payload } = params;
    const headersRequest = {
      'Content-Type': 'application/json',
      "accept": "application/json",
      'platform':1,
      'accept-language':'en'
    };
    try{
        const resp = await axios
          .get(`${url}`, {
            headers: headersRequest,
            params: payload,
            paramsSerializer: function paramsSerializer(params) {
              return Object.entries(params)
                .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
                .join('&');
            }
    
          });
        return resp.data;
    }
    catch(e){
      throw e;
    }
  }

  async postData(params: { url : string, body : Object}) {
    const { url , body } = params
    const headersRequest = {
      'Content-Type': 'application/json',
      "accept": "application/json",
      'api_key': SERVER.API_KEY,
      'authorization':'Basic bGlseTpsaWx5QDEyMw==',
      'platform':1,
      'accept-language':'en'
    };
    try{
      const resp = await axios
          .post( url, body, {
            headers: headersRequest,
      })
      return resp.data;

    }catch(e){
      throw e;
    }
  }

  async post(params: any) {
    const { url , body, auth } = params
    console.log( {url , body: JSON.stringify(body)})
    const headersRequest = {
      'Content-Type': 'application/json',
      "accept": "application/json",
      'api_key': SERVER.API_KEY,
      'authorization':auth ? auth : "Basic bGlseTpsaWx5QDEyMw==", // NOSONAR
      'platform':1,
      'accept-language':'en'
    };
    try{
      const resp = await axios
          .post( url, body, {
            headers: headersRequest,
      })
      return resp?.data;

    }catch(e){
      throw e.response?.data;
    }
  }

  async putData(params: any) {
    const { url, body, query } = params
    console.log({ url, body: JSON.stringify(body) })
    const headersRequest = {
      'Content-Type': 'application/json',
    };
    const resp = await axios.put(
      url,
      body,
      {
        headers: headersRequest,
        params: query,
        paramsSerializer: function paramsSerializer(params) {
          return Object.entries(Object.assign({}, params)). // NOSONAR
            map(([key, value]) => `${key}=${value}`).
            join('&');
        }
      }
    )
    return resp;
  }

  async patchData(params: any) {
    const { url, body, auth } = params
    console.log({ url, body: JSON.stringify(body) })
    const headersRequest = {
      'Content-Type': 'application/json',
      "accept": "application/json",
      'api_key': SERVER.API_KEY,
      'authorization':auth ? auth : "Basic bGlseTpsaWx5QDEyMw==", // NOSONAR
      'platform':1,
      'accept-language':'en'
    };
    try{
      const resp = await axios.patch(
        url,
        body,
        {
          headers: headersRequest,
        }
      )
      return resp.data;
    }
    catch(error){
      throw error;
    }
  }

  async patch(params: any) {
    const { url, body, auth } = params
    console.log({ url, body: JSON.stringify(body) })
    const headersRequest = {
      'Content-Type': 'application/json',
      "accept": "application/json",
      'api_key': SERVER.API_KEY,
      'authorization':auth ? auth : "Basic bGlseTpsaWx5QDEyMw==", // NOSONAR
      'platform':1,
      'accept-language':'en'
    };
    try{
      const resp = await axios.patch(
        url,
        body,
        {
          headers: headersRequest,
        }
      )
      return resp.data;
    }
    catch(e){
      throw e.response.data;
    }
  }
}


export const axiosService = new AxiosService()
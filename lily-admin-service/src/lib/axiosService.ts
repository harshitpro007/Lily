import { SERVER } from '@config/environment';
import axios from 'axios';
export class AxiosService {
  async getData(params: any) {
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
    catch(error){
      throw error;
    }
  }

  async postData(params: { url : string, body : Object}) {
    const { url , body } = params
    console.log( {url , body: JSON.stringify(body)})
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

    }catch(error){
      throw error;
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
      return resp.data;

    }catch(error){
      throw error.response.data;
    }
  }

  async putData(params: any) {
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
      const resp = await axios.put(
        url,
        body,
        {
          headers: headersRequest
        }
      )
      return resp.data;
    }
    catch(error){
      throw error.response.data;
    }
    
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

  async get(params: any) {
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
        });
      return resp.data;
    }
    catch(error){
      throw error;
    }
  }
}


export const axiosService = new AxiosService()
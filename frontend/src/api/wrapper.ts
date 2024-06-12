import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

const client = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
});

export const AxiosWrapper = (config: AxiosRequestConfig) => {
    const onSuccess = (response: AxiosResponse) => {
        return response.data;
    };

    const onError = (error: AxiosError) => {
        console.error('Request Failed:', error.config);

        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
            console.error('Headers:', error.response.headers);
        } else {
            console.error('Error Message:', error.message);
        }

        return Promise.reject(error.response || error.message);
    };

    return client(config).then(onSuccess).catch(onError);
};

import axios from "axios";
import config from "../../config";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import {  TPaymentData } from "./ssl.interface";

const initPyament = async (paymentData: TPaymentData) => {
  const payload = {
    store_id: config.SSL.STORE_ID as string,
    store_passwd: config.SSL.STORE_PASSWORD as string,
    total_amount: paymentData.amount,
    currency: "BDT",
    tran_id: paymentData.transactionId,
    success_url: config.SSL.SUCCESS_URL,
    fail_url: config.SSL.FAIL_URL,
    cancel_url: config.SSL.CANCEL_URL,
    ipn_url: "http://localhost:3030/ipn",
    shipping_method: "N/A",
    product_name: "Computer.",
    product_category: "Service",
    product_profile: "general",
    cus_name: paymentData.name,
    cus_email: paymentData.email,
    cus_add1: paymentData.address,
    cus_add2: "N/A",
    cus_city: "Dhaka",
    cus_state: "Dhaka",
    cus_postcode: "1000",
    cus_country: "Bangladesh",
    cus_phone: paymentData.phoneNumber,
    cus_fax: "01711111111",
    ship_name: "N/A",
    ship_add1: "N/A",
    ship_add2: "N/A",
    ship_city: "N/A",
    ship_state: "N/A",
    ship_postcode: 1000,
    ship_country: "N/A",
  };

  try {
    const response = await axios({
      method: "post",
      url: config.SSL.SSL_PAYMENT_URL,
      data: payload,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return response.data;
  } catch (e) {
    throw new AppError(httpStatus.BAD_REQUEST, "Payment error occured");
  }
};

const validatePayment = async(payload:any)=>{
 try{
  const response = await axios({
    method: "GET",
    url: `${config.SSL.SSL_VALIDATION_URL}?val_id=${payload.val_id}&store_id=${config.SSL.STORE_ID}&store_passwd=${config.SSL.STORE_PASSWORD}&format=json`,
  });
 return response.data
 }catch(err){
  throw new AppError(httpStatus.BAD_REQUEST,"Payment validation Failed")
 }
}

export const SSLService = { initPyament,validatePayment };

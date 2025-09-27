"use client";
import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
export const GET_LOGIN_LOADING = "GET_LOGIN_LOADING";
export const GET_LOGIN_SUCCESS = "GET_LOGIN_SUCCESS";
export const GET_LOGIN_ERROR = "GET_LOGIN_ERROR";
export const IS_AUTHENTICATED = "IS_AUTHENTICATED";

//login
const getLoginloading = () => ({
  type: GET_LOGIN_LOADING,
});
const getLoginSuccess = (payload) => ({
  type: GET_LOGIN_SUCCESS,
  payload,
});
const getLoginError = (payload) => ({
  type: GET_LOGIN_ERROR,
  payload,
});

const isAuthenticated = (payload) => ({
  type: IS_AUTHENTICATED,
  payload,
});

export const getLoginToken = (payload) => (dispatch) => {
  dispatch(getLoginloading());
  axios({
    url: `${import.meta.env.VITE_HRMS_MA_API}/api/login`,
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    data: JSON.stringify(payload),
  })
    .then((res) => {
      toast.success(res?.data?.message);
      console.log("res", res?.data)
      dispatch(getLoginSuccess(res?.data));
      Cookies.set("HRMS_Auth_Token", res?.data?.token, { expires: 2 });
      Cookies.set(
        "HRMS_LoggedIn_UserData",
        JSON.stringify(res?.data?.userDetails),
        {
          expires: 2,
        }
      );
      if (typeof window !== "undefined")
        window.location.href = "/dashboard/chats";
    })
    .catch((error) => {
      // console.log(error?.response?.data?.message);
      toast.error(error?.response?.data?.message);
      dispatch(getLoginError(error?.response?.data?.message));
    });
};




// export const getLoginToken = (payload) => (dispatch) => {
//   dispatch(getLoginloading());
//   axios({
//     url: "https://eminenture.live/hrms-auth-app/public/api/login",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     method: "POST",
//     data: JSON.stringify(payload),
//   })
//     .then((res) => {
//       toast.success(res?.data?.message);
//       console.log("emi", res.data)
//       dispatch(getLoginSuccess(res?.data));
//       Cookies.set("HRMS_Auth_Token", res?.data?.token, { expires: 2 });
//       Cookies.set(
//         "HRMS_LoggedIn_UserData",
//         JSON.stringify(res?.data?.userDetails),
//         {
//           expires: 2,
//         }
//       );
//       // console.log(res?.data);
//       if (typeof window !== "undefined")
//         window.location.href = "/dashboard/chats";
//     })
//     .catch((error) => {
//       // console.log(error?.response?.data?.message);
//       toast.error(error?.response?.data?.message);
//       dispatch(getLoginError(error?.response?.data?.message));
//     });
// };

import axios from "axios";
import { toast } from "react-toastify";

// export const base_url = import.meta.env.VITE_API_BASE_URL || "https://backend.arshbio.tech";
export const base_url = "http://127.0.0.1:8000";


export const urls = {
  addcompany: "/superadmin/addcompany",
  uploadcompanylogo: "/superadmin/upload-company-logo",
  addaddress: "/superadmin/addaddress",
  addvendor: "/superadmin/addvendor",
  addterms: "/superadmin/addterms",
  addshipping: "/superadmin/addshipping",
  addcurrency: "/superadmin/addcurrency",
  addproduct: "/superadmin/addproduct",
  addremarks: "/superadmin/addremarks",
  adduser: "/superadmin/adduser",
  addpo: "/superadmin/addpo",
  addinvoice: "/superadmin/addinvoice",

  login: "/superadmin/login",
  setuppassword: "/superadmin/setup-password",
  verify: "/superadmin/verify",
  logout: "/superadmin/logout",

  filters: "/superadmin/filters",
  edit: "/superadmin/edit",
  dashboard: "/superadmin/dashboard"
    
};

const handleApiError = (error) => {
  const errors = error?.response?.data?.data;
  console.log(error?.response)

  if (errors) {
    Object.entries(errors).forEach(([key, value]) => {
      const message = Array.isArray(value)
        ? value.join(", ")
        : value;
      toast.error(`${key} : ${message}`);
    });
  } else {
    toast.error(error?.response?.data?.message || "Network Error");
  }
};

export const getData = (url, payload) => {
  return async () => {
    try {
      const response = await axios.post(base_url + url, payload);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  };
};

export const postOrUpdateData = (url, payload) => {
  return async () => {
    try {
      const response = await axios.post(base_url + url, payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (response?.data?.success) {
        toast.success(response.data.message || "Success");
      } else {
        toast.error(response?.data?.message || "Failed to update data");
      }

      return response?.data;
    } catch (error) {
      handleApiError(error);
    }
  };
};

export const uploadFile = (url, formData) => {
  return async () => {
    try {
      const response = await axios.post(base_url + url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response?.data?.success) {
        toast.success(response.data.message || "File uploaded successfully");
      }

      return response?.data;
    } catch (error) {
      handleApiError(error);
    }
  };
};


import axiosLib from "axios";

// const base = "/api/";
// const base = "http://localhost:4000/";
const base = "http://localhost:4000/";

// Tạo một axios của axios
const axios = axiosLib.create({
  baseURL: base, 
});

// Thêm một request interceptor để gắn accessToken vào header của mỗi yêu cầu
axios.interceptors.request.use(
  (config: any) => {
    let accessToken;
    if (typeof window !== "undefined") {
      accessToken = localStorage.getItem("accessToken");

      if (accessToken) {
        config.headers["token"] = accessToken; // Gắn accessToken vào header với tên 'token'
      }
    }
    return config;
  },
  (error: any) => {
    // Xử lý lỗi nếu có trong quá trình cấu hình yêu cầu
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  // @ts-ignore
  (response) => {
    // Xử lý dữ liệu phản hồi nếu thành công
    return {
      data: response.data,
      newID: response.data?.newID,
      code: response.data?.code,
      status: response.status,
    };
  },
  (error: any) => {
    if (error.response) {
      // Server trả về phản hồi với status không nằm trong khoảng 2xx
      console.error(`Error Status: ${error.response.status}`);
      console.error("Error Data:", error.response.data); // Dữ liệu trả về từ server
      console.error("Error Headers:", error.response.headers);
    } else if (error.request) {
      // Yêu cầu đã được gửi nhưng không nhận được phản hồi từ server
      console.error("No Response Received:", error);
    } else {
      // Một lỗi khác xảy ra trong quá trình thiết lập yêu cầu
      console.error("Error Message:", error.message);
    }
    return Promise.reject(error); // Tiếp tục trả về lỗi để xử lý ở nơi gọi API
  }
);

export default axios;

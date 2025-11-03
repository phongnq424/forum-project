const authService = {
  register: async function (data) {
    try {
      const res = await AxiosClient.post("/auth/register", data);
      return res.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Register is unsuccessful!!!"
      );
    }
  },
};

export default authService;

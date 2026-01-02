import axiosClient from "@/api/AxiosClient";
import General from "@/General/General";

export const uploadTestcaseZip = (challengeId: string, file: File) => {
  try {
    const formData = new FormData();
    formData.append("zipfile", file); // ⚠️ phải đúng tên multer: zipfile

    return axiosClient.post(`/testcases/${challengeId}/upload-zip`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  } catch (error) {
    throw General.createError(error);
  }
};

import { toast } from "react-toastify";

export const handleDownload = async (fileUrl, fileName) => {
  const toastId = toast.loading("Downloading file...");
  // console.log("data", fileUrl, fileName )
  try {
    const response = await fetch(fileUrl, { mode: "cors" });

    if (!response.ok) {
      toast.update(toastId, {
        render: "File not found or server error",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    // Extract part after the first underscore
    const cleanFileName = fileName.substring(fileName.indexOf("_") + 1);

    const a = document.createElement("a");
    a.href = url;
    a.download = cleanFileName;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);

    toast.update(toastId, {
      render: "Download started!",
      type: "success",
      isLoading: false,
      autoClose: 3000,
    });
  } catch (err) {
    console.error("Download failed:", err);
    toast.update(toastId, {
      render: "Failed to download file",
      type: "error",
      isLoading: false,
      autoClose: 3000,
    });
  }
};

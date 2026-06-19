const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Uploads PDF files to the server.
// Returns the list of file paths where the server saved them.
export async function uploadPdfs(files: File[], caseId?: number): Promise<string[]> {
  const formData = new FormData();

  for (const file of files) {
    formData.append("files", file);
  }

  if (caseId) {
    formData.append("case_id", caseId.toString());
  }

  const response = await fetch(`${API_BASE_URL}/upload-pdfs`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to upload PDFs");
  }

  const result = await response.json();
  return result.saved_paths as string[];
}

// Uploads image files to the server.
export async function uploadImages(files: File[], caseId?: number): Promise<string[]> {
  const formData = new FormData();

  for (const file of files) {
    formData.append("files", file);
  }

  if (caseId) {
    formData.append("case_id", caseId.toString());
  }

  const response = await fetch(`${API_BASE_URL}/upload-images`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to upload images");
  }

  const result = await response.json();
  console.log(result);
  
  return result.saved_paths as string[];
}

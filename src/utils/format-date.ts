// helper to safely format dates for the <input type="date">
export const formatDate = (dateString?: string) => {
  if (!dateString) return "";
  return new Date(dateString).toISOString().split("T")[0];
};

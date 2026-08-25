import axiosClient from "./axios";

const BASE_PATH = "/worker/job-posts";

function mapJobPost(raw) {
  return {
    id: raw.jobPost_Id,
    title: raw.jobPost_Title,
    description: raw.jobPost_Description,
    price: raw.jobPost_Price,
    budgetType: raw.jobPost_BudgetType,
    professionId: raw.jobPost_ProfessionId,
    cityId: raw.jobPost_CityId,
    status: raw.jobPost_Status,
    createdAt: raw.jobPost_CreatedAt,
    clientId: raw.jobPost_ClientId,
    clientName: raw.user_FullName,
    clientRating: raw.user_AvgRating,
  };
}

export async function getJobPosts({
  cityId,
  professionId,
  budgetType,
  maxPrice,
} = {}) {
  const params = {};

  if (cityId) {
    params.cityId = Number(cityId);
  }

  if (professionId) {
    params.professionId = Number(professionId);
  }

  if (budgetType !== "" && budgetType !== undefined) {
    params.type = Number(budgetType);
  }

  if (maxPrice) {
    params.maxPrice = Number(maxPrice);
  }

  try {
    const { data } = await axiosClient.get(BASE_PATH, {
      params,
    });

    if (!data.success) {
      throw new Error(
        data.message || "Could not load job posts."
      );
    }

    return (data.data ?? []).map(mapJobPost);
  } catch (err) {
    const backendMessage =
      err.response?.data?.message;

    throw new Error(
      backendMessage ||
      err.message ||
      "Could not load job posts."
    );
  }
}
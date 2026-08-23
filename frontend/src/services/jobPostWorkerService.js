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
    params.cityId = cityId;
  }

  if (professionId) {
    params.professionId = professionId;
  }

  if (budgetType) {
    params.type = budgetType;
  }

  if (maxPrice) {
    params.maxPrice = maxPrice;
  }

  const { data } = await axiosClient.get(
    BASE_PATH,
    { params }
  );

  if (!data.success) {
    throw new Error(
      data.message || "Could not load job posts."
    );
  }

  return (data.data ?? []).map(mapJobPost);
}
export const CITIES = [
  { id: 1, name: "Beirut" },
  { id: 2, name: "Tripoli" },
  { id: 3, name: "Sidon" },
  { id: 4, name: "Jounieh" },
  { id: 5, name: "Zahle" },
  { id: 6, name: "Aley" },
];

export const PROFESSIONS = [
  { id: 1, name: "Plumbing" },
  { id: 2, name: "Electrical" },
  { id: 3, name: "Carpentry" },
  { id: 4, name: "Painting" },
  { id: 5, name: "Landscaping" },
  { id: 6, name: "HVAC" },
  { id: 7, name: "Web Development" },
  { id: 8, name: "Graphic Design" },
];

export const BUDGET_TYPES = [
  { value: 1, label: "Fixed price" },
  { value: 2, label: "Hourly rate" },
];

// A small rotating palette so any number of professions gets a
// consistent, readable color without hand-maintaining one per name.
const CATEGORY_PALETTE = ["blue", "amber", "pink", "indigo", "green", "cyan"];

export function getCategoryColor(professionId) {
  if (!professionId) return CATEGORY_PALETTE[0];
  const index = (Number(professionId) - 1) % CATEGORY_PALETTE.length;
  return CATEGORY_PALETTE[index];
}

export function getCityName(cityId) {
  return CITIES.find((c) => c.id === Number(cityId))?.name ?? "Lebanon";
}

export function getProfessionName(professionId) {
  return PROFESSIONS.find((p) => p.id === Number(professionId))?.name ?? "General";
}
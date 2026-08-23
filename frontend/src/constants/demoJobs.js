export const DEMO_JOBS = [
  {
    id: 101,
    title: "Kitchen Sink Plumbing Repair",
    description:
      "Looking for an experienced plumber to repair a leaking kitchen sink and check the water pressure. The job should ideally be completed this week. anyone instersted me connect with lets know each other and see what is best for both us lets do it and it will be easy and convenient for both of use we will benefit a lot from this arragements",
    price: 80,
    budgetType: 1,
    professionId: 1,
    cityId: 1,
    createdAt: new Date(
      Date.now() - 1000 * 60 * 25
    ).toISOString(),
    clientId: 12,
    clientName: "Sarah Haddad",
    clientRating: 4.8,
  },

  {
    id: 102,
    title: "Install New Electrical Outlets",
    description:
      "I need a qualified electrician to install three additional electrical outlets in my apartment and inspect an existing outlet.",
    price: 25,
    budgetType: 2,
    professionId: 2,
    cityId: 4,
    createdAt: new Date(
      Date.now() - 1000 * 60 * 60 * 2
    ).toISOString(),
    clientId: 15,
    clientName: "Michael Khoury",
    clientRating: 4.6,
  },

  {
    id: 103,
    title: "Custom Wooden Shelves",
    description:
      "Looking for a carpenter to build and install custom floating shelves for a living room wall. Materials can be discussed.",
    price: 150,
    budgetType: 1,
    professionId: 3,
    cityId: 6,
    createdAt: new Date(
      Date.now() - 1000 * 60 * 60 * 5
    ).toISOString(),
    clientId: 18,
    clientName: "Nadine Saad",
    clientRating: 5,
  },
];
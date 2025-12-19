let ads = [];
let idCounter = 1;

export const AdsStore = {
  findAll: () => ads,

  findById: (id) => ads.find(a => a.id === id),

  create: (data) => {
    const ad = {
      id: idCounter++,
      createdAt: new Date().toISOString(),
      ...data
    };
    ads.push(ad);
    return ad;
  },

  update: (id, data) => {
    const index = ads.findIndex(a => a.id === id);
    if (index === -1) return null;
    ads[index] = { ...ads[index], ...data };
    return ads[index];
  },

  remove: (id) => {
    ads = ads.filter(a => a.id !== id);
  }
};

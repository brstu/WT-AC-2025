import { AdsStore } from '../data/ads.store.js';
import { ApiError } from '../utils/ApiError.js';

export const getAllAds = (req, res) => {
  res.json(AdsStore.findAll());
};

export const getAdById = (req, res) => {
  const ad = AdsStore.findById(+req.params.id);
  if (!ad) throw new ApiError(404, 'Ad not found');
  res.json(ad);
};

export const createAd = (req, res) => {
  const ad = AdsStore.create(req.body);
  res.status(201).json(ad);
};

export const updateAd = (req, res) => {
  const ad = AdsStore.update(+req.params.id, req.body);
  if (!ad) throw new ApiError(404, 'Ad not found');
  res.json(ad);
};

export const deleteAd = (req, res) => {
  AdsStore.remove(+req.params.id);
  res.status(204).send();
};

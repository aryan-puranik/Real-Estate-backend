import Consultation from "../models/Consultation.js";

export const isSlotAvailable = async (officeLocation, scheduledAt) => {
  const existing = await Consultation.findOne({
    officeLocation,
    scheduledAt,
    status: { $in: ["Requested", "Confirmed"] }
  });

  return !existing;
};

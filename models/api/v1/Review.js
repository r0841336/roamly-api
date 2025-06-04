const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  placeName: {
    type: String,
    required: true
  },
    username: { 
    type: String,
    default: "Anonymous"
  },
  general: {
    accessibility: String,
    parkingSuitable: String,
    entranceAccessible: String,
    movement: String,
    restroomsAccessible: String,
    staffSupport: String,
    recommend: String
  },
  parking: {
    designatedSpot: String,
    sizeRating: String,
    entranceAccessible: String,
    closeToEntrance: String,
    smoothPath: String,
    obstacles: String
  },
  entrance: {
    doorWidthOK: String,
    stepsOrThresholds: String,
    rampAvailable: String,
    doorType: String
  },
  internalNavigation: {
    pathWidthOK: String,
    elevatorOrRamp: String,
    elevatorAccessible: String,
    obstaclesLevel: String,
    obstaclesDescription: String
  },
  sanitary: {
    accessibleRestroom: String,
    doorWidthOK: String,
    spaceToManeuver: String,
    grabBarsInstalled: String,
    sinkAccessible: String,
    showerAvailable: String
  },
  staff: {
    knowledgeable: String,
    assistanceWillingness: String,
    communicationEffective: String,
    comments: String
  },
  recommendation: {
    whyOrWhyNot: String,
    additionalFeedback: String
  },
  textReview: {
  type: String,
  default: ""
},
photos: {
  type: [String], // Array van URLs of base64 strings
  default: []
},
  points: {
    type: Number,
    default: 0
  },
  sectionsCompleted: {
    type: [String],
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
